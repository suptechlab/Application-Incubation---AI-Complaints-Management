package com.seps.ticket.service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.seps.ticket.component.EnumUtil;
import com.seps.ticket.config.InstantTypeAdapter;
import com.seps.ticket.domain.Authority;
import com.seps.ticket.domain.ClaimTicket;
import com.seps.ticket.domain.User;
import com.seps.ticket.repository.*;
import com.seps.ticket.security.AuthoritiesConstants;
import com.seps.ticket.service.dto.ClaimTicketListDTO;
import com.seps.ticket.service.dto.ClaimTicketResponseDTO;
import com.seps.ticket.service.dto.DropdownListAgentForTagDTO;
import com.seps.ticket.service.mapper.ClaimTicketMapper;
import com.seps.ticket.service.mapper.UserClaimTicketMapper;
import com.seps.ticket.service.specification.ClaimTicketSpecification;
import com.seps.ticket.suptech.service.DocumentService;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import com.seps.ticket.web.rest.vm.ClaimTicketFilterRequest;
import com.seps.ticket.web.rest.vm.CreateClaimTicketRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

import java.time.Instant;
import java.util.List;
import java.util.stream.Stream;

@Service
public class ClaimTicketService {

    private static final Logger LOG = LoggerFactory.getLogger(ClaimTicketService.class);

    private final ProvinceRepository provinceRepository;
    private final CityRepository cityRepository;
    private final OrganizationRepository organizationRepository;
    private final ClaimTypeRepository claimTypeRepository;
    private final ClaimSubTypeRepository claimSubTypeRepository;
    private final ClaimTicketRepository claimTicketRepository;
    private final UserService userService;
    private final UserClaimTicketMapper userClaimTicketMapper;
    private final AuditLogService auditLogService;
    private final Gson gson;
    private final MessageSource messageSource;
    private final ClaimTicketMapper claimTicketMapper;
    private final DocumentService documentService;
    private final ClaimTicketDocumentRepository claimTicketDocumentRepository;
    private final ClaimTicketStatusLogRepository claimTicketStatusLogRepository;
    private final ClaimTicketInstanceLogRepository claimTicketInstanceLogRepository;
    private final ClaimTicketPriorityLogRepository claimTicketPriorityLogRepository;
    private static final boolean IS_INTERNAL_DOCUMENT = false;
    private final EnumUtil enumUtil;
    private final ClaimTicketActivityLogService claimTicketActivityLogService;
    private final ClaimTicketWorkFlowService claimTicketWorkFlowService;
    private final UserRepository userRepository;
    private final ClaimTicketAssignLogRepository claimTicketAssignLogRepository;

    public ClaimTicketService(ProvinceRepository provinceRepository, CityRepository cityRepository, OrganizationRepository organizationRepository, ClaimTypeRepository claimTypeRepository, ClaimSubTypeRepository claimSubTypeRepository, ClaimTicketRepository claimTicketRepository, UserService userService, UserClaimTicketMapper userClaimTicketMapper, AuditLogService auditLogService, Gson gson, MessageSource messageSource, ClaimTicketMapper claimTicketMapper, DocumentService documentService, ClaimTicketDocumentRepository claimTicketDocumentRepository, ClaimTicketStatusLogRepository claimTicketStatusLogRepository, ClaimTicketInstanceLogRepository claimTicketInstanceLogRepository, ClaimTicketPriorityLogRepository claimTicketPriorityLogRepository, EnumUtil enumUtil, ClaimTicketActivityLogService claimTicketActivityLogService, ClaimTicketWorkFlowService claimTicketWorkFlowService, UserRepository userRepository, ClaimTicketAssignLogRepository claimTicketAssignLogRepository) {
        this.provinceRepository = provinceRepository;
        this.cityRepository = cityRepository;
        this.organizationRepository = organizationRepository;
        this.claimTypeRepository = claimTypeRepository;
        this.claimSubTypeRepository = claimSubTypeRepository;
        this.claimTicketRepository = claimTicketRepository;
        this.userService = userService;
        this.userClaimTicketMapper = userClaimTicketMapper;
        this.auditLogService = auditLogService;
        this.gson = new GsonBuilder()
            .registerTypeAdapter(Instant.class, new InstantTypeAdapter())
            .create();
        this.messageSource = messageSource;
        this.claimTicketMapper = claimTicketMapper;
        this.documentService = documentService;
        this.claimTicketDocumentRepository = claimTicketDocumentRepository;
        this.claimTicketStatusLogRepository = claimTicketStatusLogRepository;
        this.claimTicketInstanceLogRepository = claimTicketInstanceLogRepository;
        this.claimTicketPriorityLogRepository = claimTicketPriorityLogRepository;
        this.enumUtil = enumUtil;
        this.claimTicketActivityLogService = claimTicketActivityLogService;
        this.claimTicketWorkFlowService = claimTicketWorkFlowService;
        this.userRepository = userRepository;
        this.claimTicketAssignLogRepository = claimTicketAssignLogRepository;
    }


    public ClaimTicketResponseDTO createClaimTicket(@Valid CreateClaimTicketRequest claimTicketRequest,
                                                    HttpServletRequest request) {
        return null;
    }

    /**
     * Retrieves a combined list of SEPS users and FI users associated with a specific claim ticket
     * and maps them into `DropdownListAgentForTagDTO` objects.
     *
     * @param ticketId the ID of the claim ticket for which the agent list needs to be retrieved.
     * @return a list of `DropdownListAgentForTagDTO` objects containing the details of SEPS users and FI users.
     *
     * @throws CustomException if the claim ticket is not found for the given ticket ID or
     *                         if the user does not have the necessary authority.
     */
    @Transactional
    public List<DropdownListAgentForTagDTO> getAgentListForTagging(Long ticketId) {
        User currentUser = userService.getCurrentUser();

        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();

        // Find the ticket by ID
        ClaimTicket ticket;
        if (authority.contains(AuthoritiesConstants.FI)) {
            Long organizationId = currentUser.getOrganization().getId();
            ticket = claimTicketRepository.findByIdAndOrganizationId(ticketId, organizationId)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        } else {
            ticket = claimTicketRepository.findById(ticketId)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        }

        List<User> sepsUsers =  userService.getUserListBySepsUser();
        List<User> fiUsers = userService.getUserListByOrganizationIdFI(ticket.getOrganizationId());

        // Combine the lists and map them to DTOs
        return Stream.concat(sepsUsers.stream(), fiUsers.stream())
            .map(user -> new DropdownListAgentForTagDTO(
                user.getId(),
                user.getFirstName(),
                user.getEmail()
            ))
            .distinct() // Optional: Remove duplicates if necessary
            .toList();
    }

    /**
     * Retrieves a paginated list of claim tickets for SEPS and FI users that are tagged to the current user.
     *
     * <p>This method applies filters based on the provided {@link ClaimTicketFilterRequest}
     * and the current user's role and organization. If no filter request is provided,
     * a default filter is initialized. The method ensures that FI users are restricted
     * to claim tickets within their organization.
     *
     * <p>The claim tickets are fetched using a custom specification that matches the
     * "tagged to user" criteria, and the result mapped to {@link ClaimTicketListDTO}.
     *
     * @param pageable      the pagination and sorting information
     * @param filterRequest the filter criteria for claim tickets; if null, a default filter is used
     * @return a {@link Page} of {@link ClaimTicketListDTO} containing the filtered claim tickets
     *
     */
    @Transactional(readOnly = true)
    public Page<ClaimTicketListDTO> listSepsAndFiClaimTicketsForTaggedUser(Pageable pageable, ClaimTicketFilterRequest filterRequest) {

        // If no filterRequest is provided, initialize a default object
        if (filterRequest == null) {
            filterRequest = new ClaimTicketFilterRequest();
        }

        User currentUser = userService.getCurrentUser();

        List<String> authority = currentUser.getAuthorities().stream()
                .map(Authority::getName)
                .toList();

        if (authority.contains(AuthoritiesConstants.FI)) {
            filterRequest.setOrganizationId(currentUser.getOrganization().getId());
        }

        return claimTicketRepository.findAll(ClaimTicketSpecification.taggedToUser(filterRequest, currentUser.getId()), pageable)
                .map(claimTicketMapper::toListDTO);
    }
}
