package com.seps.ticket.service;

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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;


@Service
public class SepsAndFiClaimTicketService {

    private final ClaimTicketRepository claimTicketRepository;
    private final UserService userService;
    private final ClaimTicketMapper claimTicketMapper;

    public SepsAndFiClaimTicketService(ClaimTicketRepository claimTicketRepository,
                                       UserService userService,
                                       ClaimTicketMapper claimTicketMapper) {
        this.claimTicketRepository = claimTicketRepository;
        this.userService = userService;
        this.claimTicketMapper = claimTicketMapper;
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
        if(authority.contains(AuthoritiesConstants.FI)){
            organizationId = currentUser.getOrganization().getId();
            if(currentUser.hasRoleSlug(Constants.RIGHTS_FI_ADMIN)){
                List<User> userList = userService.getUserListByRoleSlug(organizationId, Constants.RIGHTS_FI_AGENT);
                // Map user list to DropdownListDTO
                agentList = userList.stream()
                    .map(user -> new DropdownListDTO(user.getId(), user.getFirstName() + " " + user.getLastName()))
                    .toList();
            }
        }else{
            if(currentUser.hasRoleSlug(Constants.RIGHTS_SEPS_ADMIN) || authority.contains(AuthoritiesConstants.ADMIN)){
                List<User> userList = userService.getUserListByRoleSlug(Constants.RIGHTS_SEPS_AGENT);
                // Map user list to DropdownListDTO
                agentList = userList.stream()
                    .map(user -> new DropdownListDTO(user.getId(), user.getFirstName() + " " + user.getLastName()))
                    .toList();
            }
        }
        return agentList;
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

            // Assign the agent to each ticket
            tickets.forEach(ticket -> {
                // Calculate and set SLA breach date
                if (ticket.getSlaBreachDays() != null) {
                    LocalDate slaBreachDate = LocalDate.now().plusDays(ticket.getSlaBreachDays());
                    ticket.setSlaBreachDate(slaBreachDate);
                }
                ticket.setFiAgentId(agent.getId());
                ticket.setFiAgent(agent);
                ticket.setAssignedAt(Instant.now());
            });

            // Save the updated tickets
            claimTicketRepository.saveAll(tickets);
        }
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
        // Update the priority
        ticket.setPriority(priority);

        // Save the updated ticket
        claimTicketRepository.save(ticket);
    }
}
