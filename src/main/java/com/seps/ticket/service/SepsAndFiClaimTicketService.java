package com.seps.ticket.service;

import com.seps.ticket.component.EnumUtil;
import com.seps.ticket.config.Constants;
import com.seps.ticket.domain.*;
import com.seps.ticket.enums.*;
import com.seps.ticket.repository.*;
import com.seps.ticket.security.AuthoritiesConstants;
import com.seps.ticket.service.dto.AssignTicketRequestDTO;
import com.seps.ticket.service.dto.ClaimTicketDTO;
import com.seps.ticket.service.dto.DropdownListDTO;
import com.seps.ticket.service.mapper.ClaimTicketMapper;
import com.seps.ticket.service.specification.ClaimTicketSpecification;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import jakarta.validation.Valid;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

import static com.seps.ticket.component.CommonHelper.convertEntityToMap;


@Service
public class SepsAndFiClaimTicketService {

    private final ClaimTicketRepository claimTicketRepository;
    private final UserService userService;
    private final ClaimTicketMapper claimTicketMapper;
    private final ClaimTicketActivityLogService claimTicketActivityLogService;
    private final MessageSource messageSource;
    private final EnumUtil enumUtil;
    public SepsAndFiClaimTicketService(ClaimTicketRepository claimTicketRepository, UserService userService,
                                       ClaimTicketMapper claimTicketMapper, ClaimTicketActivityLogService claimTicketActivityLogService,
                                       MessageSource messageSource, EnumUtil enumUtil) {
        this.claimTicketRepository = claimTicketRepository;
        this.userService = userService;
        this.claimTicketMapper = claimTicketMapper;
        this.claimTicketActivityLogService = claimTicketActivityLogService;
        this.messageSource = messageSource;
        this.enumUtil = enumUtil;
    }

    @Transactional
    public Page<ClaimTicketDTO> listSepsAndFiClaimTickets(Pageable pageable, String search, ClaimTicketStatusEnum claimTicketStatus, ClaimTicketPriorityEnum claimTicketPriority, String startDate, String endDate, Long organizationId, Long claimTypeId) {
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        Long fiAgentId = null;
        if(authority.contains(AuthoritiesConstants.FI)){
            organizationId = currentUser.getOrganization().getId();
            if(currentUser.hasRoleSlug(Constants.RIGHTS_FI_AGENT)){
                fiAgentId = currentUser.getId();
            }
        }else {
            if(currentUser.hasRoleSlug(Constants.RIGHTS_SEPS_AGENT)){
                //sepsAgentId = currentUser.getId();
            }
        }

        return claimTicketRepository.findAll(ClaimTicketSpecification.bySepsFiFilter(search, organizationId, claimTicketStatus, claimTicketPriority, startDate, endDate, fiAgentId, claimTypeId), pageable)
            .map(claimTicketMapper::toDTO);
    }

    @Transactional
    public ClaimTicketDTO getSepsFiClaimTicketById(Long id) {
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        Long organizationId = null;
        if(authority.contains(AuthoritiesConstants.FI)){
            organizationId = currentUser.getOrganization().getId();
        }
        if(organizationId!=null) {
            return claimTicketRepository.findByIdAndOrganizationId(id, organizationId)
                .map(claimTicketMapper::toDTO)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{id.toString()}, null));
        }else{
            return claimTicketRepository.findById(id)
                .map(claimTicketMapper::toDTO)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{id.toString()}, null));
        }
    }

    @Transactional
    public List<DropdownListDTO> getAgentList() {
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        Long organizationId = null;
        List<DropdownListDTO> agentList = new ArrayList<>();
        if (authority.contains(AuthoritiesConstants.FI)) {
            organizationId = currentUser.getOrganization().getId();
            if (currentUser.hasRoleSlug(Constants.RIGHTS_FI_ADMIN)) {
                List<User> userList = userService.getUserListByRoleSlug(organizationId, Constants.RIGHTS_FI_AGENT);
                agentList = userList.stream()
                    .map(this::mapToDropdown)
                    .toList();
            }
        } else if (currentUser.hasRoleSlug(Constants.RIGHTS_SEPS_ADMIN) || authority.contains(AuthoritiesConstants.ADMIN)) {
            List<User> userList = userService.getUserListByRoleSlug(Constants.RIGHTS_SEPS_AGENT);
            agentList = userList.stream()
                .map(this::mapToDropdown)
                .toList();
        }
        return agentList;
    }

    private DropdownListDTO mapToDropdown(User user) {
        String fullName = user.getFirstName() +
            (user.getLastName() != null && !user.getLastName().isEmpty() ? " " + user.getLastName() : "");
        return new DropdownListDTO(user.getId(), fullName);
    }

    @Transactional
    public void assignTicketsToFiAgent(Long agentId, @Valid AssignTicketRequestDTO assignTicketRequestDTO) {
        // Validate agent
        User agent = userService.getUserById(agentId);

        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        if(authority.contains(AuthoritiesConstants.FI) && currentUser.hasRoleSlug(Constants.RIGHTS_FI_ADMIN)) {
            Long organizationId = currentUser.getOrganization().getId();
            if (!agent.hasRoleSlug(Constants.RIGHTS_FI_AGENT)) {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.IS_NOT_FI_AGENT, new String[]{agentId.toString()}, null);
            }
            // Fetch tickets by IDs
            List<ClaimTicket> tickets = claimTicketRepository.findAllByIdInAndOrganizationId(assignTicketRequestDTO.getTicketIds(), organizationId);

            if (tickets.isEmpty()) {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.NO_TICKET_FOUND_WITH_PROVIDED_IDS, new String[]{assignTicketRequestDTO.toString()}, null);
            }
            List<ClaimTicketActivityLog> activityLogList = new ArrayList<>();
            // Assign the agent to each ticket
            tickets.forEach(ticket -> {
                if(ticket.getFiAgentId() != null && ticket.getFiAgentId().equals(agentId)) {
                    return;
                }
                ClaimTicketActivityLog activityLog = createAssignToAgentActivityLog(currentUser, ticket, agent);
                // Calculate and set SLA breach date
                if (ticket.getSlaBreachDays() != null) {
                    LocalDate slaBreachDate = LocalDate.now().plusDays(ticket.getSlaBreachDays());
                    ticket.setSlaBreachDate(slaBreachDate);
                }
                ticket.setFiAgentId(agent.getId());
                ticket.setFiAgent(agent);
                ticket.setAssignedAt(Instant.now());

                activityLogList.add(activityLog);
            });

            // Save the updated tickets
            claimTicketRepository.saveAll(tickets);

            activityLogList.forEach(claimTicketActivityLogService::saveActivityLog);
        }else{
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.YOU_NOT_AUTHORIZED_TO_PERFORM, new String[]{assignTicketRequestDTO.toString()}, null);
        }
    }

    private ClaimTicketActivityLog createAssignToAgentActivityLog(User currentUser, ClaimTicket ticket, User agent){
        ClaimTicketActivityLog activityLog = new ClaimTicketActivityLog();
        activityLog.setTicketId(ticket.getId());
        activityLog.setPerformedBy(currentUser.getId());
        Map<String, String> activityTitle = new HashMap<>();
        Map<String, String> linkedUser = new HashMap<>();
        Map<String, Object> activityDetail = new HashMap<>();
        if(ticket.getFiAgentId() != null) {
            activityLog.setActivityType(ClaimTicketActivityEnum.REASSIGNED.name());
            linkedUser.put(ticket.getFiAgentId().toString(),ticket.getFiAgent().getFirstName());
            Arrays.stream(LanguageEnum.values()).forEach(language -> {
                String messageAudit = messageSource.getMessage("ticket.activity.log.ticket.reassigned.to.agent",
                    new Object[]{"@"+currentUser.getId(), "@"+ticket.getFiAgentId(), "@"+agent.getId()}, Locale.forLanguageTag(language.getCode()));
                activityTitle.put(language.getCode(), messageAudit);
            });
            activityDetail.put("previousAssignee",convertEntityToMap(claimTicketMapper.toFIUserDTO(ticket.getFiAgent())));
            activityDetail.put("newAssignee", convertEntityToMap(claimTicketMapper.toFIUserDTO(agent)));
        }else{
            activityLog.setActivityType(ClaimTicketActivityEnum.ASSIGNED.name());
            Arrays.stream(LanguageEnum.values()).forEach(language -> {
                String messageAudit = messageSource.getMessage("ticket.activity.log.ticket.assigned.to.agent",
                    new Object[]{"@"+currentUser.getId(), "@"+agent.getId()}, Locale.forLanguageTag(language.getCode()));
                activityTitle.put(language.getCode(), messageAudit);
            });
            activityDetail.put("newAssignee",convertEntityToMap(claimTicketMapper.toFIUserDTO(agent)));
        }
        activityDetail.put("performBy",convertEntityToMap(claimTicketMapper.toFIUserDTO(currentUser)));
        activityDetail.put("ticketId",ticket.getTicketId().toString());
        linkedUser.put(currentUser.getId().toString(),currentUser.getFirstName());
        linkedUser.put(agent.getId().toString(),agent.getFirstName());

        activityLog.setActivityTitle(activityTitle);
        activityLog.setLinkedUsers(linkedUser);
        activityLog.setActivityDetails(activityDetail);
        return activityLog;
    }

    @Transactional
    public void assignTicketsToSepsAgent(Long agentId, @Valid AssignTicketRequestDTO assignTicketRequestDTO) {
        // Validate agent
        User agent = userService.getUserById(agentId);

        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();

        if(authority.contains(AuthoritiesConstants.SEPS) || authority.contains(AuthoritiesConstants.ADMIN)) {
            if (!agent.hasRoleSlug(Constants.RIGHTS_SEPS_AGENT)) {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.IS_NOT_SEPS_AGENT, new String[]{agentId.toString()}, null);
            }
            // Fetch tickets by IDs
            List<ClaimTicket> tickets = claimTicketRepository.findAllById(assignTicketRequestDTO.getTicketIds());

            if (tickets.isEmpty()) {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.NO_TICKET_FOUND_WITH_PROVIDED_IDS, new String[]{assignTicketRequestDTO.toString()}, null);
            }

            // Assign the agent to each ticket
//            tickets.forEach(ticket -> {
//            // Calculate and set SLA breach date
//            if (ticket.getSlaBreachDays() != null) {
//                LocalDate slaBreachDate = LocalDate.now().plusDays(ticket.getSlaBreachDays());
//                ticket.setSlaBreachDate(slaBreachDate);
//            }
//                ticket.setFiAgentId(agent.getId());
//                ticket.setFiAgent(agent);
//                ticket.setAssignedAt(Instant.now());
//            });

            // Save the updated tickets
            //claimTicketRepository.saveAll(tickets);
        }
    }

    @Transactional
    public void updatePriority(Long ticketId, ClaimTicketPriorityEnum priority) {
        // Get the current user
        User currentUser = userService.getCurrentUser();

        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();

        // Check if the user is FI-Admin
        if (
            (authority.contains(AuthoritiesConstants.FI) && !currentUser.hasRoleSlug(Constants.RIGHTS_FI_ADMIN)) ||
                (authority.contains(AuthoritiesConstants.SEPS) && !currentUser.hasRoleSlug(Constants.RIGHTS_SEPS_ADMIN)) ||
                (!authority.contains(AuthoritiesConstants.ADMIN))
        ) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.YOU_NOT_AUTHORIZED_TO_PERFORM, null, null);
        }

        // Find the ticket by ID
        ClaimTicket ticket;
        if(authority.contains(AuthoritiesConstants.FI)) {
            Long organizationId = currentUser.getOrganization().getId();
            ticket = claimTicketRepository.findByIdAndOrganizationId(ticketId, organizationId)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                new String[]{ticketId.toString()}, null));
        }else{
            ticket = claimTicketRepository.findById(ticketId)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        }
        ClaimTicketActivityLog activityLog = createUpdatePriorityActivityLog(currentUser,ticket,priority);
        // Update the priority
        ticket.setPriority(priority);

        // Save the updated ticket
        claimTicketRepository.save(ticket);
        claimTicketActivityLogService.saveActivityLog(activityLog);
    }

    private ClaimTicketActivityLog createUpdatePriorityActivityLog(User currentUser, ClaimTicket ticket, ClaimTicketPriorityEnum priority){
        ClaimTicketActivityLog activityLog = new ClaimTicketActivityLog();
        activityLog.setTicketId(ticket.getId());
        activityLog.setPerformedBy(currentUser.getId());
        Map<String, String> activityTitle = new HashMap<>();
        Map<String, String> linkedUser = new HashMap<>();
        Map<String, Object> activityDetail = new HashMap<>();
        Map<String, String> oldPriority = new HashMap<>();
        Map<String, String> newPriority = new HashMap<>();
        activityLog.setActivityType(ClaimTicketActivityEnum.CHANGED_PRIORITY.name());
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("ticket.activity.log.ticket.changed.priority",
                new Object[]{"@"+currentUser.getId(), enumUtil.getLocalizedEnumValue(priority, Locale.forLanguageTag(language.getCode()))}, Locale.forLanguageTag(language.getCode()));
            activityTitle.put(language.getCode(), messageAudit);
            oldPriority.put(language.getCode(), enumUtil.getLocalizedEnumValue(ticket.getPriority(), Locale.forLanguageTag(language.getCode())));
            newPriority.put(language.getCode(), enumUtil.getLocalizedEnumValue(priority, Locale.forLanguageTag(language.getCode())));
        });
        activityDetail.put("oldPriority",oldPriority);
        activityDetail.put("newPriority", newPriority);

        activityDetail.put("performBy",convertEntityToMap(claimTicketMapper.toFIUserDTO(currentUser)));
        activityDetail.put("ticketId",ticket.getTicketId().toString());
        linkedUser.put(currentUser.getId().toString(),currentUser.getFirstName());

        activityLog.setActivityTitle(activityTitle);
        activityLog.setLinkedUsers(linkedUser);
        activityLog.setActivityDetails(activityDetail);
        return activityLog;
    }
}
