package com.seps.ticket.service;

import com.google.gson.Gson;
import com.seps.ticket.component.EnumUtil;
import com.seps.ticket.config.Constants;
import com.seps.ticket.domain.*;
import com.seps.ticket.enums.*;
import com.seps.ticket.repository.*;
import com.seps.ticket.security.AuthoritiesConstants;
import com.seps.ticket.service.dto.*;
import com.seps.ticket.service.mapper.ClaimTicketMapper;
import com.seps.ticket.service.projection.ClaimStatusCountProjection;
import com.seps.ticket.service.specification.ClaimTicketSpecification;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import com.seps.ticket.web.rest.vm.ClaimTicketClosedRequest;
import jakarta.validation.Valid;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
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
    private final Gson gson;
    private final AuditLogService auditLogService;
    private final ClaimTicketAssignLogRepository claimTicketAssignLogRepository;
    private final ClaimTicketPriorityLogRepository claimTicketPriorityLogRepository;
    private final ClaimTicketStatusLogRepository claimTicketStatusLogRepository;

    public SepsAndFiClaimTicketService(ClaimTicketRepository claimTicketRepository, UserService userService,
                                       ClaimTicketMapper claimTicketMapper, ClaimTicketActivityLogService claimTicketActivityLogService,
                                       MessageSource messageSource, EnumUtil enumUtil, Gson gson, AuditLogService auditLogService,
                                       ClaimTicketAssignLogRepository claimTicketAssignLogRepository, ClaimTicketPriorityLogRepository claimTicketPriorityLogRepository,
                                       ClaimTicketStatusLogRepository claimTicketStatusLogRepository) {
        this.claimTicketRepository = claimTicketRepository;
        this.userService = userService;
        this.claimTicketMapper = claimTicketMapper;
        this.claimTicketActivityLogService = claimTicketActivityLogService;
        this.messageSource = messageSource;
        this.enumUtil = enumUtil;
        this.gson = gson;
        this.auditLogService = auditLogService;
        this.claimTicketAssignLogRepository = claimTicketAssignLogRepository;
        this.claimTicketPriorityLogRepository = claimTicketPriorityLogRepository;
        this.claimTicketStatusLogRepository = claimTicketStatusLogRepository;
    }

    @Transactional
    public Page<ClaimTicketDTO> listSepsAndFiClaimTickets(Pageable pageable, String search, ClaimTicketStatusEnum claimTicketStatus, ClaimTicketPriorityEnum claimTicketPriority, String startDate, String endDate, Long organizationId, Long claimTypeId) {
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        Long fiAgentId = null;
        Long sepsAgentId = null;
        if(authority.contains(AuthoritiesConstants.FI)){
            organizationId = currentUser.getOrganization().getId();
            if(currentUser.hasRoleSlug(Constants.RIGHTS_FI_AGENT)){
                fiAgentId = currentUser.getId();
            }
        }else {
            if(currentUser.hasRoleSlug(Constants.RIGHTS_SEPS_AGENT)){
                sepsAgentId = currentUser.getId();
            }
        }

        return claimTicketRepository.findAll(ClaimTicketSpecification.bySepsFiFilter(search, organizationId, claimTicketStatus, claimTicketPriority, startDate, endDate, fiAgentId, claimTypeId, sepsAgentId), pageable)
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
            List<ClaimTicketAssignLog> assignLogsList= new ArrayList<>();
            List<ClaimTicketStatusLog> claimTicketStatusLogList= new ArrayList<>();
            // Assign the agent to each ticket
            tickets.forEach(ticket -> {
                if(ticket.getFiAgentId() != null && ticket.getFiAgentId().equals(agentId)) {
                    return;
                }
                ClaimTicketActivityLog activityLog = createAssignToAgentActivityLog(currentUser, ticket, agent);
                // Calculate and set SLA breach date
                if (ticket.getSlaBreachDays() != null && ticket.getFiAgentId() == null) {
                    LocalDate slaBreachDate = LocalDate.now().plusDays(ticket.getSlaBreachDays());
                    ticket.setSlaBreachDate(slaBreachDate);
                }
                ticket.setFiAgentId(agent.getId());
                ticket.setFiAgent(agent);
                ticket.setStatus(ClaimTicketStatusEnum.ASSIGNED);
                ticket.setAssignedAt(Instant.now());

                activityLogList.add(activityLog);

                //Save ClaimTicketAssignLog table
                ClaimTicketAssignLog assignLog = new ClaimTicketAssignLog();
                assignLog.setTicketId(ticket.getId());
                assignLog.setUserId(agentId);
                assignLog.setUserType(UserTypeEnum.FI_USER);
                assignLog.setCreatedBy(currentUser.getId());
                assignLogsList.add(assignLog);

                //Save ClaimTicketStatusLog table
                ClaimTicketStatusLog claimTicketStatusLog = new ClaimTicketStatusLog();
                claimTicketStatusLog.setTicketId(ticket.getId());
                claimTicketStatusLog.setStatus(ClaimTicketStatusEnum.ASSIGNED);
                claimTicketStatusLog.setCreatedBy(currentUser.getId());
                claimTicketStatusLogList.add(claimTicketStatusLog);
            });

            // Save the updated tickets
            claimTicketRepository.saveAll(tickets);

            activityLogList.forEach(claimTicketActivityLogService::saveActivityLog);
            claimTicketAssignLogRepository.saveAll(assignLogsList);
            claimTicketStatusLogRepository.saveAll(claimTicketStatusLogList);

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
        activityDetail.put(Constants.PERFORM_BY,convertEntityToMap(claimTicketMapper.toFIUserDTO(currentUser)));
        activityDetail.put(Constants.TICKET_ID,ticket.getTicketId().toString());
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

            // Validate that all tickets are of the SECOND_INSTANCE type
            boolean allSecondInstance = tickets.stream()
                .allMatch(ticket -> ticket.getInstanceType() == InstanceTypeEnum.SECOND_INSTANCE);

            if (!allSecondInstance) {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_INSTANCE_TYPE_ALLOW_ONLY_INSTANCE, new String[]{enumUtil.getLocalizedEnumValue(InstanceTypeEnum.SECOND_INSTANCE, LocaleContextHolder.getLocale())}, null);
            }

            List<ClaimTicketActivityLog> activityLogList = new ArrayList<>();
            List<ClaimTicketAssignLog> assignLogsList= new ArrayList<>();
            List<ClaimTicketStatusLog> claimTicketStatusLogList= new ArrayList<>();
            // Assign the agent to each ticket
            tickets.forEach(ticket -> {
                if(ticket.getSepsAgentId() != null && ticket.getSepsAgentId().equals(agentId)) {
                    return;
                }
                ClaimTicketActivityLog activityLog = createAssignToAgentActivityLog(currentUser, ticket, agent);
                // Calculate and set SLA breach date
                if (ticket.getSlaBreachDays() != null && ticket.getSepsAgentId() == null) {
                    LocalDate slaBreachDate = LocalDate.now().plusDays(ticket.getSlaBreachDays());
                    ticket.setSlaBreachDate(slaBreachDate);
                }
                ticket.setSepsAgentId(agent.getId());
                ticket.setSepsAgent(agent);
                ticket.setAssignedAt(Instant.now());
                activityLogList.add(activityLog);

                //Save ClaimTicketAssignLog table
                ClaimTicketAssignLog assignLog = new ClaimTicketAssignLog();
                assignLog.setTicketId(ticket.getId());
                assignLog.setUserId(agentId);
                assignLog.setUserType(UserTypeEnum.SEPS_USER);
                assignLog.setCreatedBy(currentUser.getId());
                assignLogsList.add(assignLog);

                //Save ClaimTicketStatusLog table
                ClaimTicketStatusLog claimTicketStatusLog = new ClaimTicketStatusLog();
                claimTicketStatusLog.setTicketId(ticket.getId());
                claimTicketStatusLog.setStatus(ClaimTicketStatusEnum.ASSIGNED);
                claimTicketStatusLog.setCreatedBy(currentUser.getId());
                claimTicketStatusLogList.add(claimTicketStatusLog);

            });

            // Save the updated tickets
            claimTicketRepository.saveAll(tickets);
            activityLogList.forEach(claimTicketActivityLogService::saveActivityLog);
            claimTicketAssignLogRepository.saveAll(assignLogsList);
            claimTicketStatusLogRepository.saveAll(claimTicketStatusLogList);
        }else{
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.YOU_NOT_AUTHORIZED_TO_PERFORM, new String[]{assignTicketRequestDTO.toString()}, null);
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
        // Save the priority log
        ClaimTicketPriorityLog claimTicketPriorityLog= new ClaimTicketPriorityLog();
        claimTicketPriorityLog.setTicketId(ticket.getId());
        claimTicketPriorityLog.setCreatedBy(currentUser.getId());
        claimTicketPriorityLog.setPriority(priority);
        claimTicketPriorityLogRepository.save(claimTicketPriorityLog);
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

        activityDetail.put(Constants.PERFORM_BY,convertEntityToMap(claimTicketMapper.toFIUserDTO(currentUser)));
        activityDetail.put(Constants.TICKET_ID,ticket.getTicketId().toString());
        linkedUser.put(currentUser.getId().toString(),currentUser.getFirstName());

        activityLog.setActivityTitle(activityTitle);
        activityLog.setLinkedUsers(linkedUser);
        activityLog.setActivityDetails(activityDetail);
        return activityLog;
    }

    @Transactional
    public void extendSlaDate(Long ticketId, LocalDate newSlaDate, String reason, RequestInfo requestInfo) {
        // Get the current user
        User currentUser = userService.getCurrentUser();

        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();

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
        if(ticket.getFiAgentId() == null){
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_ASSIGNED, null, null);
        }
        // Validate the new SLA date
        if (newSlaDate.isBefore(ticket.getSlaBreachDate()) || newSlaDate.equals(ticket.getSlaBreachDate())) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_SLA_DATE, null, null);
        }

        Map<String, Object> oldData = convertEntityToMap(this.getSepsFiClaimTicketById(ticketId));

        ClaimTicketActivityLog activityLog = createExtendDateActivityLog(currentUser,ticket,newSlaDate,reason);
        ticket.setSlaBreachDate(newSlaDate);
        ticket.setUpdatedBy(currentUser.getId());

        // Save the updated ticket
        ClaimTicket savedTicket = claimTicketRepository.save(ticket);
        claimTicketActivityLogService.saveActivityLog(activityLog);

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.ticket.extend.sla.date",
                new Object[]{currentUser.getEmail(), newSlaDate.toString(), String.valueOf(ticket.getTicketId())}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getSepsFiClaimTicketById(savedTicket.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        Map<String, String> req = new HashMap<>();
        req.put("newSlaDate", newSlaDate.toString());
        req.put("reason", reason);
        String requestBody = gson.toJson(req);
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "extendSlaDate", ActionTypeEnum.CLAIM_TICKET_EXTEND_SLA_DATE.name(), savedTicket.getId(), ClaimTicket.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);
    }

    private ClaimTicketActivityLog createExtendDateActivityLog(User currentUser, ClaimTicket ticket, LocalDate newSlaDate, String reason) {
        ClaimTicketActivityLog activityLog = new ClaimTicketActivityLog();
        activityLog.setTicketId(ticket.getId());
        activityLog.setPerformedBy(currentUser.getId());
        Map<String, String> activityTitle = new HashMap<>();
        Map<String, String> linkedUser = new HashMap<>();
        Map<String, Object> activityDetail = new HashMap<>();

        activityLog.setActivityType(ClaimTicketActivityEnum.DATE_EXTENDED.name());
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("ticket.activity.log.ticket.extend.sla.date",
                new Object[]{"@"+currentUser.getId(), newSlaDate.toString()}, Locale.forLanguageTag(language.getCode()));
            activityTitle.put(language.getCode(), messageAudit);
        });
        activityDetail.put("previousSlaDate",ticket.getSlaBreachDate());
        activityDetail.put("newSlaDate", newSlaDate);
        activityDetail.put(Constants.PERFORM_BY,convertEntityToMap(claimTicketMapper.toUserDTO(currentUser)));
        activityDetail.put(Constants.TICKET_ID,ticket.getTicketId().toString());
        activityDetail.put("text",reason);
        linkedUser.put(currentUser.getId().toString(),currentUser.getFirstName());

        activityLog.setActivityTitle(activityTitle);
        activityLog.setLinkedUsers(linkedUser);
        activityLog.setActivityDetails(activityDetail);
        return activityLog;
    }

    @Transactional
    public ClaimStatusCountResponseDTO countClaimsByStatusAndTotal() {
        User currentUser = userService.getCurrentUser();
        Long userId = currentUser.getId();

        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        List<ClaimStatusCountProjection> projections;
        if(authority.contains(AuthoritiesConstants.FI)) {
            Long organizationId = currentUser.getOrganization().getId();
            if(currentUser.hasRoleSlug(Constants.RIGHTS_FI_ADMIN)){
                projections = claimTicketRepository.countClaimsByStatusAndTotalFiAgentAndOrganizationId(null, organizationId);
            }else{
                projections = claimTicketRepository.countClaimsByStatusAndTotalFiAgentAndOrganizationId(userId, organizationId);
            }
        }else{
            if(currentUser.hasRoleSlug(Constants.RIGHTS_SEPS_AGENT)){
                projections = claimTicketRepository.countClaimsByStatusAndTotalSEPS(userId);
            }else {
                projections = claimTicketRepository.countClaimsByStatusAndTotalSEPS(null);
            }
        }

        ClaimStatusCountResponseDTO result = new ClaimStatusCountResponseDTO();
        // Fetch counts by status using the repository

        // Map the results to a status-to-count map
        Map<ClaimTicketStatusEnum, Long> countsByStatus = new EnumMap<>(ClaimTicketStatusEnum.class);
        for (ClaimStatusCountProjection projection : projections) {
            countsByStatus.put(projection.getStatus(), projection.getCount());
        }
        // Ensure all statuses are present in the map
        for (ClaimTicketStatusEnum status : ClaimTicketStatusEnum.values()) {
            countsByStatus.putIfAbsent(status, 0L);
        }
        // Calculate the total count of claims
        long totalClaims = countsByStatus.values().stream().mapToLong(Long::longValue).sum();
        // Add data to the result map
        result.setCountsByStatus(countsByStatus);
        result.setTotalClaims(totalClaims);
        return result;
    }

    @Transactional
    public void closedClaimTicket(Long ticketId, @Valid ClaimTicketClosedRequest claimTicketClosedRequest, RequestInfo requestInfo) {
        User currentUser = userService.getCurrentUser();

        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();

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
        Map<String, Object> oldData = convertEntityToMap(this.getSepsFiClaimTicketById(ticketId));
        ClaimTicketActivityLog activityLog = createClosedClaimActivityLog(currentUser,ticket,claimTicketClosedRequest);

        ticket.setStatus(ClaimTicketStatusEnum.CLOSED);
        ticket.setClosedStatus(claimTicketClosedRequest.getCloseSubStatus());
        ticket.setStatusComment(claimTicketClosedRequest.getReason());
        ticket.setUpdatedBy(currentUser.getId());

        // Save the updated ticket
        ClaimTicket savedTicket = claimTicketRepository.save(ticket);
        claimTicketActivityLogService.saveActivityLog(activityLog);

        //Save ClaimTicketStatusLog table
        ClaimTicketStatusLog claimTicketStatusLog = new ClaimTicketStatusLog();
        claimTicketStatusLog.setTicketId(ticket.getId());
        claimTicketStatusLog.setStatus(ClaimTicketStatusEnum.CLOSED);
        claimTicketStatusLog.setSubStatus(claimTicketClosedRequest.getCloseSubStatus().ordinal());
        claimTicketStatusLog.setCreatedBy(currentUser.getId());
        claimTicketStatusLogRepository.save(claimTicketStatusLog);

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.ticket.closed",
                new Object[]{currentUser.getEmail(), String.valueOf(ticket.getTicketId()), enumUtil.getLocalizedEnumValue(claimTicketClosedRequest.getCloseSubStatus(),Locale.forLanguageTag(language.getCode()))}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getSepsFiClaimTicketById(savedTicket.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        String requestBody = gson.toJson(claimTicketClosedRequest);
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "closedClaimTicket", ActionTypeEnum.CLAIM_TICKET_CLOSED.name(), savedTicket.getId(), ClaimTicket.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);

    }

    private ClaimTicketActivityLog createClosedClaimActivityLog(User currentUser, ClaimTicket ticket, ClaimTicketClosedRequest claimTicketClosedRequest) {
        ClaimTicketActivityLog activityLog = new ClaimTicketActivityLog();
        activityLog.setTicketId(ticket.getId());
        activityLog.setPerformedBy(currentUser.getId());
        Map<String, String> activityTitle = new HashMap<>();
        Map<String, String> linkedUser = new HashMap<>();
        Map<String, Object> activityDetail = new HashMap<>();
        Map<String, String> subStatus = new HashMap<>();
        activityLog.setActivityType(ClaimTicketActivityEnum.CLOSED.name());
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("ticket.activity.log.ticket.closed",
                new Object[]{"@"+currentUser.getId()}, Locale.forLanguageTag(language.getCode()));
            activityTitle.put(language.getCode(), messageAudit);
            subStatus.put(language.getCode(), enumUtil.getLocalizedEnumValue(claimTicketClosedRequest.getCloseSubStatus(),Locale.forLanguageTag(language.getCode())));
        });
        activityDetail.put("subStatus",subStatus);
        activityDetail.put(Constants.PERFORM_BY,convertEntityToMap(claimTicketMapper.toUserDTO(currentUser)));
        activityDetail.put(Constants.TICKET_ID,ticket.getTicketId().toString());
        activityDetail.put("text",claimTicketClosedRequest.getReason());
        linkedUser.put(currentUser.getId().toString(),currentUser.getFirstName());

        activityLog.setActivityTitle(activityTitle);
        activityLog.setLinkedUsers(linkedUser);
        activityLog.setActivityDetails(activityDetail);
        return activityLog;
    }

//    private void sendClosedTicketEmail(ClaimTicket ticket, ClaimTicketClosedRequest claimTicketClosedRequest, User currentUser) {
//        // Fetch related users
//        User customer = userService.getUserById(ticket.getUserId());
//        List<User> fiAdmin = userService.getUserListByRoleSlug(ticket.getOrganizationId(), Constants.RIGHTS_FI_ADMIN);
//        User agent = userService.getUserById(ticket.getFiAgentId());
//
//        // Create the email content
//        String subject = "Claim Ticket #" + ticket.getTicketId() + " Closed";
//        String message = String.format(
//            "Dear %s,\n\n" +
//                "This is to inform you that the claim ticket #%d has been closed.\n\n" +
//                "Reason: %s\n" +
//                "Status: %s\n\n" +
//                "Thank you for your cooperation.\n\n" +
//                "Regards,\nSupport Team",
//            "%s", // Placeholder for user's name
//            ticket.getTicketId(),
//            claimTicketClosedRequest.getReason(),
//            claimTicketClosedRequest.getCloseSubStatus().name()
//        );
//
//        // Send email to the customer
//        emailService.sendEmail(customer.getEmail(), subject, String.format(message, customer.getFullName()));
//
//        // Send email to FI Admin
//        if (fiAdmin != null) {
//            emailService.sendEmail(fiAdmin.getEmail(), subject, String.format(message, fiAdmin.getFullName()));
//        }
//
//        // Send email to the agent
//        if (agent != null) {
//            emailService.sendEmail(agent.getEmail(), subject, String.format(message, agent.getFullName()));
//        }
//    }

}
