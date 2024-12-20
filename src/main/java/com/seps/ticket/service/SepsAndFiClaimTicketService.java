package com.seps.ticket.service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.seps.ticket.component.EnumUtil;
import com.seps.ticket.config.Constants;
import com.seps.ticket.config.InstantTypeAdapter;
import com.seps.ticket.domain.*;
import com.seps.ticket.enums.*;
import com.seps.ticket.repository.*;
import com.seps.ticket.security.AuthoritiesConstants;
import com.seps.ticket.service.dto.*;
import com.seps.ticket.service.dto.workflow.ClaimTicketWorkFlowDTO;
import com.seps.ticket.service.dto.workflow.TicketPriorityAction;
import com.seps.ticket.service.dto.workflow.TicketStatusAction;
import com.seps.ticket.service.mapper.ClaimTicketMapper;
import com.seps.ticket.service.projection.ClaimStatusCountProjection;
import com.seps.ticket.service.specification.ClaimTicketSpecification;
import com.seps.ticket.suptech.service.DocumentService;
import com.seps.ticket.suptech.service.FileStorageException;
import com.seps.ticket.suptech.service.InvalidFileTypeException;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import com.seps.ticket.web.rest.vm.ClaimTicketClosedRequest;
import com.seps.ticket.web.rest.vm.ClaimTicketFilterRequest;
import com.seps.ticket.web.rest.vm.ClaimTicketRejectRequest;
import com.seps.ticket.web.rest.vm.ClaimTicketReplyRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;
import org.zalando.problem.Status;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

import static com.seps.ticket.component.CommonHelper.convertEntityToMap;

/**
 * Service class for managing claim tickets in the SEPS and FI systems.
 *
 * <p>This service class provides various functionalities for handling claim tickets such as closing, assigning,
 * changing priority, and logging activity. It interacts with multiple repositories and services to manage the
 * life cycle of a claim ticket and send appropriate notifications.</p>
 *
 * @author [Matellio]
 */
@Service
public class SepsAndFiClaimTicketService {

    private static final Logger LOG = LoggerFactory.getLogger(SepsAndFiClaimTicketService.class);

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
    private final MailService mailService;
    private final DocumentService documentService;
    private final ClaimTicketDocumentRepository claimTicketDocumentRepository;
    private static final boolean IS_INTERNAL_DOCUMENT = false;
    private static final String ATTACHMENTS = "attachments";
    private static final String REASON = "reason";
    private final TemplateVariableMappingService templateVariableMappingService;
    private final ClaimTicketWorkFlowService claimTicketWorkFlowService;
    private final TemplateMasterRepository templateMasterRepository;
    /**
     * Constructs a new {@link SepsAndFiClaimTicketService} instance.
     *
     * <p>This constructor is responsible for injecting the necessary dependencies into the service class. These dependencies
     * provide access to repositories, utilities, and services that allow the service to perform operations such as creating
     * and updating claim tickets, logging activities, and sending notifications.</p>
     *
     * @param claimTicketRepository            the repository for interacting with claim tickets.
     * @param userService                      the service for interacting with user-related operations.
     * @param claimTicketMapper                the mapper for converting between claim ticket entities and DTOs.
     * @param claimTicketActivityLogService    the service for managing activity logs for claim tickets.
     * @param messageSource                    the service for retrieving localized messages.
     * @param enumUtil                         the utility class for handling enum-related operations.
     * @param gson                             the library for converting objects to JSON.
     * @param auditLogService                  the service for logging audit activities.
     * @param claimTicketAssignLogRepository   the repository for managing claim ticket assignment logs.
     * @param claimTicketPriorityLogRepository the repository for managing claim ticket priority logs.
     * @param claimTicketStatusLogRepository   the repository for managing claim ticket status logs.
     * @param mailService                      the service for sending email notifications.
     */
    public SepsAndFiClaimTicketService(ClaimTicketRepository claimTicketRepository, UserService userService,
                                       ClaimTicketMapper claimTicketMapper, ClaimTicketActivityLogService claimTicketActivityLogService,
                                       MessageSource messageSource, EnumUtil enumUtil, Gson gson, AuditLogService auditLogService,
                                       ClaimTicketAssignLogRepository claimTicketAssignLogRepository, ClaimTicketPriorityLogRepository claimTicketPriorityLogRepository,
                                       ClaimTicketStatusLogRepository claimTicketStatusLogRepository, MailService mailService, DocumentService documentService,
                                       ClaimTicketDocumentRepository claimTicketDocumentRepository,
                                       TemplateVariableMappingService templateVariableMappingService, ClaimTicketWorkFlowService claimTicketWorkFlowService, TemplateMasterRepository templateMasterRepository) {
        this.claimTicketRepository = claimTicketRepository;
        this.userService = userService;
        this.claimTicketMapper = claimTicketMapper;
        this.claimTicketActivityLogService = claimTicketActivityLogService;
        this.messageSource = messageSource;
        this.enumUtil = enumUtil;
        this.gson = new GsonBuilder()
            .registerTypeAdapter(Instant.class, new InstantTypeAdapter())
            .create();
        this.auditLogService = auditLogService;
        this.claimTicketAssignLogRepository = claimTicketAssignLogRepository;
        this.claimTicketPriorityLogRepository = claimTicketPriorityLogRepository;
        this.claimTicketStatusLogRepository = claimTicketStatusLogRepository;
        this.mailService = mailService;
        this.documentService = documentService;
        this.claimTicketDocumentRepository = claimTicketDocumentRepository;
        this.templateVariableMappingService = templateVariableMappingService;
        this.claimTicketWorkFlowService = claimTicketWorkFlowService;
        this.templateMasterRepository = templateMasterRepository;
    }

    /**
     * Retrieves a paginated list of claim tickets based on the provided filter criteria.
     *
     * @param pageable      the pagination and sorting information.
     * @param filterRequest the filter criteria for the claim tickets, which includes optional
     *                      parameters like search, claim ticket status, priority, date range,
     *                      organization ID, and claim type ID. If {@code null}, a default filter
     *                      request will be initialized.
     * @return a {@link Page} of {@link ClaimTicketListDTO} containing the filtered claim tickets.
     * @throws CustomException if the current user lacks appropriate permissions to view claim tickets.
     *                         <p>
     *                         This method performs the following operations:
     *                         <ul>
     *                           <li>Initializes a default filter request if none is provided.</li>
     *                           <li>Identifies the current user's roles and authorities to apply appropriate filtering logic.</li>
     *                           <li>Automatically filters claim tickets based on the current user's organization if they
     *                               belong to the FI group.</li>
     *                           <li>Applies additional filtering for FI agents or SEPS agents based on the user's role and ID.</li>
     *                           <li>Uses a specification to dynamically build the query for fetching claim tickets from
     *                               the repository.</li>
     *                         </ul>
     */

    @Transactional
    public Page<ClaimTicketListDTO> listSepsAndFiClaimTickets(Pageable pageable, ClaimTicketFilterRequest filterRequest) {
        // If no filterRequest is provided, initialize a default object
        if (filterRequest == null) {
            filterRequest = new ClaimTicketFilterRequest();
        }
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        Long fiAgentId = null;
        Long sepsAgentId = null;
        if (authority.contains(AuthoritiesConstants.FI)) {
            filterRequest.setOrganizationId(currentUser.getOrganization().getId());
            if (currentUser.hasRoleSlug(Constants.RIGHTS_FI_AGENT)) {
                fiAgentId = currentUser.getId();
            }
        } else {
            if (currentUser.hasRoleSlug(Constants.RIGHTS_SEPS_AGENT)) {
                sepsAgentId = currentUser.getId();
            }
        }

        return claimTicketRepository.findAll(ClaimTicketSpecification.bySepsFiFilter(filterRequest, fiAgentId, sepsAgentId), pageable)
            .map(claimTicketMapper::toListDTO);
    }

    /**
     * Retrieves a claim ticket by its ID with role-based access validation.
     *
     * @param id the unique identifier of the claim ticket.
     * @return the {@link ClaimTicketDTO} corresponding to the provided ID.
     * @throws CustomException if the claim ticket is not found or the user does not have the required permissions.
     * @see UserService#getCurrentUser()
     * @see ClaimTicketRepository#findByIdAndOrganizationId(Long, Long)
     * @see ClaimTicketMapper#toDTO(ClaimTicket)
     */
    @Transactional
    public ClaimTicketDTO getSepsFiClaimTicketById(Long id) {
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        Long organizationId = null;
        if (authority.contains(AuthoritiesConstants.FI)) {
            organizationId = currentUser.getOrganization().getId();
        }
        if (organizationId != null) {
            return claimTicketRepository.findByIdAndOrganizationId(id, organizationId)
                .map(claimTicketMapper::toDTO)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{id.toString()}, null));
        } else {
            return claimTicketRepository.findById(id)
                .map(claimTicketMapper::toDTO)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{id.toString()}, null));
        }
    }

    /**
     * Retrieves a list of agents based on the current user's role and organization.
     *
     * <p>This method fetches agents for either FI or SEPS roles depending on the current user's authority.
     * - For users with FI Admin rights, it retrieves agents within their organization.
     * - For users with SEPS Admin or global Admin rights, it retrieves all SEPS agents.</p>
     *
     * @return a list of {@link DropdownListDTO} representing agents available to the current user.
     * @see UserService#getCurrentUser()
     * @see UserService#getUserListByRoleSlug(Long, String)
     * @see UserService#getUserListByRoleSlug(String)
     */
    @Transactional
    public List<DropdownListDTO> getAgentList() {
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        List<DropdownListDTO> agentList = new ArrayList<>();
        if (authority.contains(AuthoritiesConstants.FI)) {
            Long organizationId = currentUser.getOrganization().getId();
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

    /**
     * Assigns a list of claim tickets to a specified FI agent.
     *
     * <p>This method validates the FI agent and assigns claim tickets to them based on the current user's
     * authority and organization. The method logs the assignment activity, status changes, and updates SLA breach dates if applicable.
     * It ensures the tickets belong to the same organization as the current user and throws an exception if
     * the agent is not an FI Agent or no tickets are found for the provided IDs.</p>
     *
     * @param agentId                the ID of the FI agent to whom the tickets will be assigned.
     * @param assignTicketRequestDTO the DTO containing the list of ticket IDs to be assigned.
     * @return a list of updated {@link ClaimTicket} entities reflecting the assignment.
     * @throws CustomException if:
     *                         <ul>
     *                             <li>The specified agent is not an FI Agent.</li>
     *                             <li>No tickets are found with the provided IDs.</li>
     *                             <li>The current user is not authorized to perform the operation.</li>
     *                         </ul>
     * @see UserService#getUserById(Long)
     * @see ClaimTicketRepository#findAllByIdInAndOrganizationId(List, Long)
     * @see ClaimTicketActivityLogService#saveActivityLog(ClaimTicketActivityLog)
     * @see ClaimTicketAssignLogRepository#saveAll(Iterable)
     * @see ClaimTicketStatusLogRepository#saveAll(Iterable)
     */
    @Transactional
    public List<ClaimTicket> assignTicketsToFiAgent(Long agentId, @Valid AssignTicketRequestDTO assignTicketRequestDTO) {
        // Validate agent
        User agent = userService.getUserById(agentId);

        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        if (authority.contains(AuthoritiesConstants.FI) && currentUser.hasRoleSlug(Constants.RIGHTS_FI_ADMIN)) {
            Long organizationId = currentUser.getOrganization().getId();
            if (!agent.hasRoleSlug(Constants.RIGHTS_FI_AGENT)) {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.IS_NOT_FI_AGENT, new String[]{agentId.toString()}, null);
            }
            // Fetch tickets by IDs
            List<ClaimTicket> tickets = claimTicketRepository.findAllByIdInAndOrganizationId(assignTicketRequestDTO.getTicketIds(), organizationId);

            if (tickets.isEmpty()) {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.NO_TICKET_FOUND_WITH_PROVIDED_IDS, new String[]{assignTicketRequestDTO.toString()}, null);
            }
            // Validate that all tickets are of the FIRST_INSTANCE type
            boolean allSecondInstance = tickets.stream()
                .allMatch(ticket -> ticket.getInstanceType() == InstanceTypeEnum.FIRST_INSTANCE);

            if (!allSecondInstance) {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_INSTANCE_TYPE_ALLOW_ONLY_INSTANCE, new String[]{enumUtil.getLocalizedEnumValue(InstanceTypeEnum.FIRST_INSTANCE, LocaleContextHolder.getLocale())}, null);
            }
            List<ClaimTicketActivityLog> activityLogList = new ArrayList<>();
            List<ClaimTicketAssignLog> assignLogsList = new ArrayList<>();
            List<ClaimTicketStatusLog> claimTicketStatusLogList = new ArrayList<>();
            // Assign the agent to each ticket
            tickets.forEach(ticket -> {
                if (ticket.getFiAgentId() != null && ticket.getFiAgentId().equals(agentId)) {
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
            List<ClaimTicket> savedTickets = claimTicketRepository.saveAll(tickets);

            activityLogList.forEach(claimTicketActivityLogService::saveActivityLog);
            claimTicketAssignLogRepository.saveAll(assignLogsList);
            claimTicketStatusLogRepository.saveAll(claimTicketStatusLogList);
            return savedTickets;
        } else {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.YOU_NOT_AUTHORIZED_TO_PERFORM, new String[]{assignTicketRequestDTO.toString()}, null);
        }
    }

    /**
     * Creates an activity log entry for assigning or reassigning a claim ticket to an FI agent.
     *
     * <p>This method determines whether the action is an assignment or reassignment based on the current state
     * of the ticket and logs the relevant details, such as the current user performing the action, the previous
     * and new assignees, and ticket-specific details. The activity log is localized in multiple languages.</p>
     *
     * @param currentUser the current user performing the action.
     * @param ticket      the claim ticket being assigned or reassigned.
     * @param agent       the FI agent to whom the ticket is assigned or reassigned.
     * @return a populated {@link ClaimTicketActivityLog} containing the details of the action.
     * @see ClaimTicketActivityLog
     * @see ClaimTicketActivityEnum
     * @see LanguageEnum
     */
    private ClaimTicketActivityLog createAssignToAgentActivityLog(User currentUser, ClaimTicket ticket, User agent) {
        ClaimTicketActivityLog activityLog = new ClaimTicketActivityLog();
        activityLog.setTicketId(ticket.getId());
        activityLog.setPerformedBy(currentUser.getId());
        Map<String, String> activityTitle = new HashMap<>();
        Map<String, String> linkedUser = new HashMap<>();
        Map<String, Object> activityDetail = new HashMap<>();
        if (ticket.getFiAgentId() != null) {
            activityLog.setActivityType(ClaimTicketActivityEnum.REASSIGNED.name());
            linkedUser.put(ticket.getFiAgentId().toString(), ticket.getFiAgent().getFirstName());
            Arrays.stream(LanguageEnum.values()).forEach(language -> {
                String messageAudit = messageSource.getMessage("ticket.activity.log.ticket.reassigned.to.agent",
                    new Object[]{"@" + currentUser.getId(), "@" + ticket.getFiAgentId(), "@" + agent.getId()}, Locale.forLanguageTag(language.getCode()));
                activityTitle.put(language.getCode(), messageAudit);
            });
            activityDetail.put("previousAssignee", convertEntityToMap(claimTicketMapper.toFIUserDTO(ticket.getFiAgent())));
            activityDetail.put("newAssignee", convertEntityToMap(claimTicketMapper.toFIUserDTO(agent)));
        } else {
            activityLog.setActivityType(ClaimTicketActivityEnum.ASSIGNED.name());
            Arrays.stream(LanguageEnum.values()).forEach(language -> {
                String messageAudit = messageSource.getMessage("ticket.activity.log.ticket.assigned.to.agent",
                    new Object[]{"@" + currentUser.getId(), "@" + agent.getId()}, Locale.forLanguageTag(language.getCode()));
                activityTitle.put(language.getCode(), messageAudit);
            });
            activityDetail.put("newAssignee", convertEntityToMap(claimTicketMapper.toFIUserDTO(agent)));
        }
        activityDetail.put(Constants.PERFORM_BY, convertEntityToMap(claimTicketMapper.toFIUserDTO(currentUser)));
        activityDetail.put(Constants.TICKET_ID, ticket.getTicketId().toString());
        linkedUser.put(currentUser.getId().toString(), currentUser.getFirstName());
        linkedUser.put(agent.getId().toString(), agent.getFirstName());

        activityLog.setActivityTitle(activityTitle);
        activityLog.setLinkedUsers(linkedUser);
        activityLog.setActivityDetails(activityDetail);
        return activityLog;
    }

    /**
     * Assigns claim tickets to a SEPS agent.
     *
     * <p>This method validates the provided agent and the claim tickets before assigning the tickets to the agent.
     * It ensures that only tickets of type {@link InstanceTypeEnum#SECOND_INSTANCE} are assigned. The method
     * also updates the SLA breach date, creates activity logs, and saves the status and assignment logs for each ticket.</p>
     *
     * @param agentId                the ID of the SEPS agent to whom the tickets are being assigned.
     * @param assignTicketRequestDTO the DTO containing the list of ticket IDs to be assigned.
     * @return a list of updated {@link ClaimTicket} entities.
     * @throws CustomException if the agent is not a SEPS agent, tickets are not found,
     *                         tickets are not of the required instance type, or the current user is unauthorized.
     * @see ClaimTicket
     * @see AssignTicketRequestDTO
     * @see ClaimTicketActivityLog
     * @see ClaimTicketAssignLog
     * @see ClaimTicketStatusLog
     * @see InstanceTypeEnum
     */
    @Transactional
    public List<ClaimTicket> assignTicketsToSepsAgent(Long agentId, @Valid AssignTicketRequestDTO assignTicketRequestDTO) {
        // Validate agent
        User agent = userService.getUserById(agentId);

        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();

        if (authority.contains(AuthoritiesConstants.SEPS) || authority.contains(AuthoritiesConstants.ADMIN)) {
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
            List<ClaimTicketAssignLog> assignLogsList = new ArrayList<>();
            List<ClaimTicketStatusLog> claimTicketStatusLogList = new ArrayList<>();
            // Assign the agent to each ticket
            tickets.forEach(ticket -> {
                if (ticket.getSepsAgentId() != null && ticket.getSepsAgentId().equals(agentId)) {
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
            List<ClaimTicket> ticketList = claimTicketRepository.saveAll(tickets);
            activityLogList.forEach(claimTicketActivityLogService::saveActivityLog);
            claimTicketAssignLogRepository.saveAll(assignLogsList);
            claimTicketStatusLogRepository.saveAll(claimTicketStatusLogList);
            return ticketList;
        } else {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.YOU_NOT_AUTHORIZED_TO_PERFORM, new String[]{assignTicketRequestDTO.toString()}, null);
        }
    }

    /**
     * Updates the priority of a claim ticket.
     *
     * <p>This method validates the user's permissions, retrieves the ticket, and updates its priority.
     * It logs the activity and audit details, saves a priority log, and sends a notification email about
     * the priority change.</p>
     *
     * @param ticketId    the ID of the claim ticket to update.
     * @param priority    the new priority to be set for the ticket.
     * @param requestInfo the request information for auditing purposes.
     * @throws CustomException if the user does not have the required permissions or if the ticket is not found.
     * @see ClaimTicket
     * @see ClaimTicketPriorityEnum
     * @see ClaimTicketActivityLog
     * @see ClaimTicketPriorityLog
     */
    @Transactional
    public void updatePriority(Long ticketId, ClaimTicketPriorityEnum priority, RequestInfo requestInfo) {
        // Get the current user
        User currentUser = userService.getCurrentUser();

        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();

        // Check if the user is FI-Admin
        if (
            (authority.contains(AuthoritiesConstants.FI) && !currentUser.hasRoleSlug(Constants.RIGHTS_FI_ADMIN)) ||
                (authority.contains(AuthoritiesConstants.SEPS) && !currentUser.hasRoleSlug(Constants.RIGHTS_SEPS_ADMIN)) ||
                (!authority.contains(AuthoritiesConstants.ADMIN) &&
                    !(authority.contains(AuthoritiesConstants.FI) || authority.contains(AuthoritiesConstants.SEPS)))
        ) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.YOU_NOT_AUTHORIZED_TO_PERFORM, null, null);
        }

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
        ClaimTicketActivityLog activityLog = createUpdatePriorityActivityLog(currentUser, ticket, priority);
        Map<String, Object> oldData = convertEntityToMap(this.getSepsFiClaimTicketById(ticketId));
        // Update the priority
        ticket.setPriority(priority);
        ticket.setUpdatedByUser(currentUser);
        // Save the updated ticket
        ClaimTicket savedTicket = claimTicketRepository.save(ticket);
        claimTicketActivityLogService.saveActivityLog(activityLog);
        // Save the priority log
        ClaimTicketPriorityLog claimTicketPriorityLog = new ClaimTicketPriorityLog();
        claimTicketPriorityLog.setTicketId(ticket.getId());
        claimTicketPriorityLog.setCreatedBy(currentUser.getId());
        claimTicketPriorityLog.setPriority(priority);
        claimTicketPriorityLogRepository.save(claimTicketPriorityLog);

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.ticket.priority.changed",
                new Object[]{currentUser.getEmail(), String.valueOf(ticket.getTicketId()), enumUtil.getLocalizedEnumValue(priority, Locale.forLanguageTag(language.getCode()))}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getSepsFiClaimTicketById(savedTicket.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        Map<String, String> req = new HashMap<>();
        req.put("newPriority", priority.name());
        String requestBody = gson.toJson(req);
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "updatePriority", ActionTypeEnum.CLAIM_TICKET_PRIORITY_CHANGE.name(), savedTicket.getId(), ClaimTicket.class.getSimpleName(),
            null, auditMessageMap, entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);

    }

    /**
     * Creates an activity log for updating the priority of a claim ticket.
     *
     * <p>This method generates a detailed log of the priority change, including the old and new priority values,
     * the user performing the action, and localized messages in multiple languages.</p>
     *
     * @param currentUser the user performing the priority update.
     * @param ticket      the claim ticket whose priority is being updated.
     * @param priority    the new priority being set.
     * @return the created {@link ClaimTicketActivityLog} object containing activity details.
     */
    private ClaimTicketActivityLog createUpdatePriorityActivityLog(User currentUser, ClaimTicket ticket, ClaimTicketPriorityEnum priority) {
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
                new Object[]{"@" + currentUser.getId(), enumUtil.getLocalizedEnumValue(priority, Locale.forLanguageTag(language.getCode()))}, Locale.forLanguageTag(language.getCode()));
            activityTitle.put(language.getCode(), messageAudit);
            oldPriority.put(language.getCode(), enumUtil.getLocalizedEnumValue(ticket.getPriority(), Locale.forLanguageTag(language.getCode())));
            newPriority.put(language.getCode(), enumUtil.getLocalizedEnumValue(priority, Locale.forLanguageTag(language.getCode())));
        });
        activityDetail.put("oldPriority", oldPriority);
        activityDetail.put("newPriority", newPriority);

        activityDetail.put(Constants.PERFORM_BY, convertEntityToMap(claimTicketMapper.toFIUserDTO(currentUser)));
        activityDetail.put(Constants.TICKET_ID, ticket.getTicketId().toString());
        linkedUser.put(currentUser.getId().toString(), currentUser.getFirstName());

        activityLog.setActivityTitle(activityTitle);
        activityLog.setLinkedUsers(linkedUser);
        activityLog.setActivityDetails(activityDetail);
        return activityLog;
    }

    /**
     * Extends the SLA date for a claim ticket.
     *
     * <p>This method validates the new SLA date, checks the user's permissions, updates the ticket's SLA breach date,
     * logs the activity, and records the audit details for the SLA extension. If the new SLA date is invalid or the ticket is
     * not assigned to an FI agent, a custom exception is thrown.</p>
     *
     * @param ticketId    the ID of the claim ticket whose SLA date is being extended.
     * @param newSlaDate  the new SLA breach date to be set for the ticket.
     * @param reason      the reason for extending the SLA date.
     * @param requestInfo the request information for auditing purposes.
     * @throws CustomException if the user does not have the required permissions, the ticket is not assigned,
     *                         or the new SLA date is invalid.
     * @see ClaimTicket
     * @see ClaimTicketActivityLog
     * @see ClaimTicketPriorityEnum
     */
    @Transactional
    public void extendSlaDate(Long ticketId, LocalDate newSlaDate, String reason, RequestInfo requestInfo) {
        // Get the current user
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
        if (ticket.getFiAgentId() == null) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_ASSIGNED, null, null);
        }
        // Validate the new SLA date
        if (newSlaDate.isBefore(ticket.getSlaBreachDate()) || newSlaDate.equals(ticket.getSlaBreachDate())) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_SLA_DATE, null, null);
        }

        Map<String, Object> oldData = convertEntityToMap(this.getSepsFiClaimTicketById(ticketId));

        ClaimTicketActivityLog activityLog = createExtendDateActivityLog(currentUser, ticket, newSlaDate, reason);
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
        req.put(REASON, reason);
        String requestBody = gson.toJson(req);
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "extendSlaDate", ActionTypeEnum.CLAIM_TICKET_EXTEND_SLA_DATE.name(), savedTicket.getId(), ClaimTicket.class.getSimpleName(),
            null, auditMessageMap, entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);
    }

    /**
     * Creates an activity log entry for extending the SLA date of a claim ticket.
     *
     * <p>This method generates an activity log for the action of extending the SLA date of a ticket. It includes details
     * such as the previous and new SLA dates, the reason for the extension, and the user who performed the action. The log
     * is created in multiple languages based on the language enum.</p>
     *
     * @param currentUser the user who performed the action of extending the SLA date.
     * @param ticket      the claim ticket for which the SLA date is being extended.
     * @param newSlaDate  the new SLA breach date to be set for the ticket.
     * @param reason      the reason provided for extending the SLA date.
     * @return a {@link ClaimTicketActivityLog} containing the details of the SLA date extension.
     * @see ClaimTicket
     * @see ClaimTicketActivityLog
     */
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
                new Object[]{"@" + currentUser.getId(), newSlaDate.toString()}, Locale.forLanguageTag(language.getCode()));
            activityTitle.put(language.getCode(), messageAudit);
        });
        activityDetail.put("previousSlaDate", ticket.getSlaBreachDate());
        activityDetail.put("newSlaDate", newSlaDate);
        activityDetail.put(Constants.PERFORM_BY, convertEntityToMap(claimTicketMapper.toUserDTO(currentUser)));
        activityDetail.put(Constants.TICKET_ID, ticket.getTicketId().toString());
        activityDetail.put("text", reason);
        linkedUser.put(currentUser.getId().toString(), currentUser.getFirstName());

        activityLog.setActivityTitle(activityTitle);
        activityLog.setLinkedUsers(linkedUser);
        activityLog.setActivityDetails(activityDetail);
        return activityLog;
    }

    /**
     * Counts the number of claims grouped by their status and calculates the total claim count.
     *
     * <p>This method retrieves the number of claims for each status and calculates the total number of claims based on the
     * current user's authority and role. It differentiates the logic based on whether the user has a Financial Institution
     * (FI) role or SEPS role, and whether the user has administrative rights within those roles. The result includes a map
     * of claim statuses to their respective counts and the total count of all claims.</p>
     *
     * @return a {@link ClaimStatusCountResponseDTO} containing the count of claims by status and the total count of claims.
     * @see ClaimStatusCountResponseDTO
     * @see ClaimTicketStatusEnum
     */
    @Transactional
    public ClaimStatusCountResponseDTO countClaimsByStatusAndTotal() {
        User currentUser = userService.getCurrentUser();
        Long userId = currentUser.getId();

        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        List<ClaimStatusCountProjection> projections;
        if (authority.contains(AuthoritiesConstants.FI)) {
            Long organizationId = currentUser.getOrganization().getId();
            if (currentUser.hasRoleSlug(Constants.RIGHTS_FI_ADMIN)) {
                projections = claimTicketRepository.countClaimsByStatusAndTotalFiAgentAndOrganizationId(null, organizationId);
            } else {
                projections = claimTicketRepository.countClaimsByStatusAndTotalFiAgentAndOrganizationId(userId, organizationId);
            }
        } else {
            if (currentUser.hasRoleSlug(Constants.RIGHTS_SEPS_AGENT)) {
                projections = claimTicketRepository.countClaimsByStatusAndTotalSEPS(userId);
            } else {
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

    /**
     * Closes a claim ticket by updating its status to "CLOSED" and saving relevant information.
     *
     * <p>This method handles the process of closing a claim ticket. It first verifies if the current user has the necessary
     * authority and role. Then it checks the ticket's current status to ensure it is not already closed or rejected. If the
     * ticket can be closed, the status is updated, a status log is created, and the activity is logged. The method also
     * sends an email notification about the closure of the ticket.</p>
     *
     * @param ticketId                 the ID of the claim ticket to be closed.
     * @param claimTicketClosedRequest the request containing the details of the closure, such as the close sub-status and reason.
     * @param requestInfo              information about the request that triggered this action.
     * @throws CustomException if the ticket cannot be found, is already closed or rejected, or if any validation fails.
     */
    @Transactional
    public void closedClaimTicket(Long ticketId, @Valid ClaimTicketClosedRequest claimTicketClosedRequest, RequestInfo requestInfo) {
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
        if (ticket.getStatus().equals(ClaimTicketStatusEnum.CLOSED) || ticket.getStatus().equals(ClaimTicketStatusEnum.REJECTED)) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_ALREADY_CLOSED_OR_REJECT, null, null);
        }
        Map<String, Object> oldData = convertEntityToMap(this.getSepsFiClaimTicketById(ticketId));
        ClaimTicketActivityLog activityLog = createClosedClaimActivityLog(currentUser, ticket, claimTicketClosedRequest);

        ticket.setStatus(ClaimTicketStatusEnum.CLOSED);
        ticket.setClosedStatus(claimTicketClosedRequest.getCloseSubStatus());
        ticket.setStatusComment(claimTicketClosedRequest.getReason());
        ticket.setResolvedOn(Instant.now());
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
        claimTicketStatusLog.setInstanceType(ticket.getInstanceType());
        claimTicketStatusLogRepository.save(claimTicketStatusLog);

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.ticket.closed",
                new Object[]{currentUser.getEmail(), String.valueOf(ticket.getTicketId()), enumUtil.getLocalizedEnumValue(claimTicketClosedRequest.getCloseSubStatus(), Locale.forLanguageTag(language.getCode()))}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        // Convert attachments (MultipartFile to filenames)
        List<String> attachments = new ArrayList<>();
        if (claimTicketClosedRequest.getAttachments() != null) {
            for (MultipartFile file : claimTicketClosedRequest.getAttachments()) {
                attachments.add(file.getOriginalFilename());  // Add only file name to the list
            }
        }
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getSepsFiClaimTicketById(savedTicket.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        Map<String, Object> req = new HashMap<>();
        req.put("closeSubStatus", claimTicketClosedRequest.getCloseSubStatus().name());
        req.put(REASON, claimTicketClosedRequest.getReason());
        req.put(ATTACHMENTS, attachments);
        String requestBody = gson.toJson(req);
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "closedClaimTicket", ActionTypeEnum.CLAIM_TICKET_CLOSED.name(), savedTicket.getId(), ClaimTicket.class.getSimpleName(),
            null, auditMessageMap, entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);

        this.sendClosedTicketEmail(savedTicket, claimTicketClosedRequest);
    }

    /**
     * Creates an activity log entry for closing a claim ticket.
     *
     * <p>This method generates an activity log when a claim ticket is closed. It captures the user who performed the action,
     * the ticket information, the close sub-status, the reason for closure, and the relevant details. The activity log
     * includes localized messages and associates the current user with the action.</p>
     *
     * @param currentUser              the user who is performing the action of closing the ticket.
     * @param ticket                   the claim ticket being closed.
     * @param claimTicketClosedRequest the request containing details of the closure such as the close sub-status and reason.
     * @return the created {@link ClaimTicketActivityLog} object containing the details of the ticket closure.
     */
    private ClaimTicketActivityLog createClosedClaimActivityLog(User currentUser, ClaimTicket ticket, ClaimTicketClosedRequest claimTicketClosedRequest) {
        DocumentSourceEnum source = DocumentSourceEnum.CLOSED_OR_REJECT_TICKET;
        // Handle attachments and save documents
        List<ClaimTicketDocument> claimTicketDocuments = uploadFileAttachments(claimTicketClosedRequest.getAttachments(), ticket, currentUser, source);
        // Save documents if any were uploaded
        Map<String, Object> attachments = new HashMap<>();
        if (!claimTicketDocuments.isEmpty()) {
            List<ClaimTicketDocument> savedDocuments = claimTicketDocumentRepository.saveAll(claimTicketDocuments);
            Set<ClaimTicketDocumentDTO> attachDocument = claimTicketMapper.toClaimTicketDocumentDTOs(savedDocuments);
            attachments.put(ATTACHMENTS, attachDocument);
        }
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
                new Object[]{"@" + currentUser.getId()}, Locale.forLanguageTag(language.getCode()));
            activityTitle.put(language.getCode(), messageAudit);
            subStatus.put(language.getCode(), enumUtil.getLocalizedEnumValue(claimTicketClosedRequest.getCloseSubStatus(), Locale.forLanguageTag(language.getCode())));
        });
        activityDetail.put("subStatus", subStatus);
        activityDetail.put(Constants.PERFORM_BY, convertEntityToMap(claimTicketMapper.toUserDTO(currentUser)));
        activityDetail.put(Constants.TICKET_ID, ticket.getTicketId().toString());
        activityDetail.put("text", claimTicketClosedRequest.getReason());
        linkedUser.put(currentUser.getId().toString(), currentUser.getFirstName());

        activityLog.setActivityTitle(activityTitle);
        activityLog.setLinkedUsers(linkedUser);
        activityLog.setActivityDetails(activityDetail);
        activityLog.setAttachmentUrl(attachments);
        return activityLog;
    }

    /**
     * Sends email notifications regarding the closure of a claim ticket to relevant users.
     *
     * <p>This method sends email notifications to the customer, FI Admin, FI agent, and SEPS agent regarding the closure of a claim ticket.</p>
     *
     * @param ticket                   the claim ticket that has been closed.
     * @param claimTicketClosedRequest the request containing details of the closure, including the reason and sub-status.
     */
    private void sendClosedTicketEmail(ClaimTicket ticket, ClaimTicketClosedRequest claimTicketClosedRequest) {
        // Fetch related users
        User customer = ticket.getUser();
        List<User> fiAdmin = userService.getUserListByRoleSlug(ticket.getOrganizationId(), Constants.RIGHTS_FI_ADMIN);
        User fiAgent = ticket.getFiAgent();
        User sepsAgent = ticket.getSepsAgent();

        // Send email to the customer
        mailService.sendClosedTicketEmail(ticket, claimTicketClosedRequest, customer);

        // Send email to FI Admin
        if (!fiAdmin.isEmpty()) {
            fiAdmin.forEach(fiAdminUser -> mailService.sendClosedTicketEmail(ticket, claimTicketClosedRequest, fiAdminUser));
        }

        // Send email to the FI agent
        if (fiAgent != null) {
            mailService.sendClosedTicketEmail(ticket, claimTicketClosedRequest, fiAgent);
        }

        // Send email to the SEPS agent
        if (sepsAgent != null) {
            mailService.sendClosedTicketEmail(ticket, claimTicketClosedRequest, sepsAgent);
        }
    }

    /**
     * Sends email notifications when the priority of a claim ticket changes.
     *
     * <p>This method sends email notifications to the FI Admin, FI agent, and SEPS agent when a claim ticket's priority is changed.</p>
     *
     * @param ticket      the claim ticket whose priority is changed.
     * @param newPriority the new priority value assigned to the ticket.
     * @param currentUser the user who is updating the ticket priority.
     */
    private void sendPriorityChangeEmail(ClaimTicket ticket, ClaimTicketPriorityEnum newPriority, User currentUser) {
        // Check if an agent is assigned to the ticket
        List<User> fiAdmin = userService.getUserListByRoleSlug(ticket.getOrganizationId(), Constants.RIGHTS_FI_ADMIN);

        final String updatedBy = currentUser.getFirstName();
        // Send email to FI Admin
        if (!fiAdmin.isEmpty()) {
            fiAdmin.forEach(fiAdminUser -> mailService.sendPriorityChangeEmail(ticket, newPriority, fiAdminUser, updatedBy));
        }

        // Send email to the FI agent
        if (ticket.getFiAgentId() != null) {
            User fiAgent = userService.getUserById(ticket.getFiAgentId());
            mailService.sendPriorityChangeEmail(ticket, newPriority, fiAgent, updatedBy);
        }

        // Send email to the SEPS agent
        if (ticket.getSepsAgentId() != null) {
            User sepsAgent = userService.getUserById(ticket.getSepsAgentId());
            mailService.sendPriorityChangeEmail(ticket, newPriority, sepsAgent, updatedBy);
        }
    }

    /**
     * Sends assignment emails to the customer and agent(s) for a list of claim tickets.
     *
     * <p>This method sends emails to the customer and the assigned agent(s) whenever a list of claim tickets is assigned.
     * It includes the customer and agent details in the email content.</p>
     *
     * @param tickets the list of claim tickets being assigned.
     * @param agentId the ID of the agent to whom the tickets are assigned.
     */
    @Transactional
    public void sendAssignmentEmails(List<ClaimTicket> tickets, Long agentId) {
        User agent = userService.getUserById(agentId);
        tickets.forEach(ticket -> {
            // Send email to the customer
            mailService.sendToCustomerTicketAssignmentEmail(ticket, ticket.getUser(), agent.getFirstName());

            // Send email to the FI agent
            mailService.sendToAgentTicketAssignmentEmail(ticket, agent);
        });
    }

    /**
     * Rejects a claim ticket with the given ID, updates its status to REJECTED,
     * and performs associated activities such as saving logs, sending audit information,
     * and notifying relevant users via email.
     *
     * @param ticketId                 the ID of the ticket to reject
     * @param claimTicketRejectRequest the details of the rejection, including reason and sub-status
     * @param requestInfo              additional request-related information for auditing
     * @throws CustomException if the ticket is not found or is already closed/rejected
     */
    @Transactional
    public void rejectClaimTicket(Long ticketId, @Valid ClaimTicketRejectRequest claimTicketRejectRequest, RequestInfo requestInfo) {
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
        if (ticket.getStatus().equals(ClaimTicketStatusEnum.CLOSED) || ticket.getStatus().equals(ClaimTicketStatusEnum.REJECTED)) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_ALREADY_CLOSED_OR_REJECT, null, null);
        }
        Map<String, Object> oldData = convertEntityToMap(this.getSepsFiClaimTicketById(ticketId));
        ClaimTicketActivityLog activityLog = createRejectedClaimActivityLog(currentUser, ticket, claimTicketRejectRequest);

        ticket.setStatus(ClaimTicketStatusEnum.REJECTED);
        ticket.setRejectedStatus(claimTicketRejectRequest.getRejectedStatus());
        ticket.setStatusComment(claimTicketRejectRequest.getReason());
        ticket.setUpdatedBy(currentUser.getId());

        // Save the updated ticket
        ClaimTicket savedTicket = claimTicketRepository.save(ticket);
        claimTicketActivityLogService.saveActivityLog(activityLog);

        //Save ClaimTicketStatusLog table
        ClaimTicketStatusLog claimTicketStatusLog = new ClaimTicketStatusLog();
        claimTicketStatusLog.setTicketId(ticket.getId());
        claimTicketStatusLog.setStatus(ClaimTicketStatusEnum.REJECTED);
        claimTicketStatusLog.setSubStatus(claimTicketRejectRequest.getRejectedStatus().ordinal());
        claimTicketStatusLog.setInstanceType(ticket.getInstanceType());
        claimTicketStatusLog.setCreatedBy(currentUser.getId());
        claimTicketStatusLogRepository.save(claimTicketStatusLog);

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.ticket.rejected",
                new Object[]{currentUser.getEmail(), String.valueOf(ticket.getTicketId()), enumUtil.getLocalizedEnumValue(claimTicketRejectRequest.getRejectedStatus(), Locale.forLanguageTag(language.getCode()))}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        // Convert attachments (MultipartFile to filenames)
        List<String> attachments = new ArrayList<>();
        if (claimTicketRejectRequest.getAttachments() != null) {
            for (MultipartFile file : claimTicketRejectRequest.getAttachments()) {
                attachments.add(file.getOriginalFilename());  // Add only file name to the list
            }
        }
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getSepsFiClaimTicketById(savedTicket.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        Map<String, Object> req = new HashMap<>();
        req.put("rejectedStatus", claimTicketRejectRequest.getRejectedStatus().name());
        req.put(REASON, claimTicketRejectRequest.getReason());
        req.put(ATTACHMENTS, attachments);
        String requestBody = gson.toJson(req);
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "rejectClaimTicket", ActionTypeEnum.CLAIM_TICKET_REJECTED.name(), savedTicket.getId(), ClaimTicket.class.getSimpleName(),
            null, auditMessageMap, entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);

        this.sendRejectedTicketEmail(savedTicket, claimTicketRejectRequest);
    }

    /**
     * Creates a log entry for a rejected claim ticket, capturing details about the action
     * and associated metadata such as the user performing the action and the reason for rejection.
     *
     * @param currentUser              the user performing the rejection
     * @param ticket                   the claim ticket being rejected
     * @param claimTicketRejectRequest the details of the rejection, including reason and sub-status
     * @return a populated ClaimTicketActivityLog instance
     */
    private ClaimTicketActivityLog createRejectedClaimActivityLog(User currentUser, ClaimTicket ticket, ClaimTicketRejectRequest claimTicketRejectRequest) {
        DocumentSourceEnum source = DocumentSourceEnum.CLOSED_OR_REJECT_TICKET;
        // Handle attachments and save documents
        List<ClaimTicketDocument> claimTicketDocuments = uploadFileAttachments(claimTicketRejectRequest.getAttachments(), ticket, currentUser, source);
        // Save documents if any were uploaded
        Map<String, Object> attachments = new HashMap<>();
        if (!claimTicketDocuments.isEmpty()) {
            List<ClaimTicketDocument> savedDocuments = claimTicketDocumentRepository.saveAll(claimTicketDocuments);
            Set<ClaimTicketDocumentDTO> attachDocument = claimTicketMapper.toClaimTicketDocumentDTOs(savedDocuments);
            attachments.put(ATTACHMENTS, attachDocument);
        }
        ClaimTicketActivityLog activityLog = new ClaimTicketActivityLog();
        activityLog.setTicketId(ticket.getId());
        activityLog.setPerformedBy(currentUser.getId());
        Map<String, String> activityTitle = new HashMap<>();
        Map<String, String> linkedUser = new HashMap<>();
        Map<String, Object> activityDetail = new HashMap<>();
        Map<String, String> subStatus = new HashMap<>();
        activityLog.setActivityType(ClaimTicketActivityEnum.REJECTED.name());
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("ticket.activity.log.ticket.rejected",
                new Object[]{"@" + currentUser.getId()}, Locale.forLanguageTag(language.getCode()));
            activityTitle.put(language.getCode(), messageAudit);
            subStatus.put(language.getCode(), enumUtil.getLocalizedEnumValue(claimTicketRejectRequest.getRejectedStatus(), Locale.forLanguageTag(language.getCode())));
        });
        activityDetail.put("subStatus", subStatus);
        activityDetail.put(Constants.PERFORM_BY, convertEntityToMap(claimTicketMapper.toUserDTO(currentUser)));
        activityDetail.put(Constants.TICKET_ID, ticket.getTicketId().toString());
        activityDetail.put("text", claimTicketRejectRequest.getReason());
        linkedUser.put(currentUser.getId().toString(), currentUser.getFirstName());

        activityLog.setActivityTitle(activityTitle);
        activityLog.setLinkedUsers(linkedUser);
        activityLog.setActivityDetails(activityDetail);
        activityLog.setAttachmentUrl(attachments);
        return activityLog;
    }

    /**
     * Sends rejection notification emails to relevant stakeholders:
     * - The customer associated with the ticket
     * - FI Admin users in the ticket's organization
     * - The FI Agent assigned to the ticket
     *
     * @param ticket                   the rejected claim ticket
     * @param claimTicketRejectRequest the details of the rejection, including reason and sub-status
     */
    private void sendRejectedTicketEmail(ClaimTicket ticket, ClaimTicketRejectRequest claimTicketRejectRequest) {
        // Fetch related users
        User customer = ticket.getUser();
        List<User> fiAdmin = userService.getUserListByRoleSlug(ticket.getOrganizationId(), Constants.RIGHTS_FI_ADMIN);
        User fiAgent = ticket.getFiAgent();

        // Send email to the customer
        mailService.sendRejectedTicketEmailToCustomer(ticket, claimTicketRejectRequest, customer);

        // Send email to FI Admin
        if (!fiAdmin.isEmpty()) {
            fiAdmin.forEach(fiAdminUser -> mailService.sendRejectedTicketEmail(ticket, claimTicketRejectRequest, fiAdminUser));
        }

        // Send email to the FI agent
        if (fiAgent != null) {
            mailService.sendRejectedTicketEmail(ticket, claimTicketRejectRequest, fiAgent);
        }

    }

    /**
     * Handles the logic for replying to a customer's ticket.
     * Validates the user's authority and ensures they are authorized to perform the action.
     * Handles file attachments and logs the activity in the ticket history.
     *
     * @param ticketId                the ID of the ticket to which the reply is being made
     * @param claimTicketReplyRequest the reply request containing the message and optional attachments
     * @throws CustomException if the ticket is not found or the user is not authorized to perform this action
     */
    @Transactional
    public void replyToCustomer(Long ticketId, @Valid ClaimTicketReplyRequest claimTicketReplyRequest) {
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();

        // Find the ticket by ID
        ClaimTicket ticket;
        if (authority.contains(AuthoritiesConstants.FI) && (currentUser.hasRoleSlug(Constants.RIGHTS_FI_ADMIN) || currentUser.hasRoleSlug(Constants.RIGHTS_FI_AGENT))) {
            Long organizationId = currentUser.getOrganization().getId();
            ticket = claimTicketRepository.findByIdAndOrganizationId(ticketId, organizationId)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        } else {
            ticket = claimTicketRepository.findById(ticketId)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        }
        if (currentUser.hasRoleSlug(Constants.RIGHTS_FI_AGENT) && !ticket.getFiAgentId().equals(currentUser.getId())) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.YOU_NOT_AUTHORIZED_TO_PERFORM, null, null);
        }
        if (ticket.getStatus().equals(ClaimTicketStatusEnum.CLOSED) || ticket.getStatus().equals(ClaimTicketStatusEnum.REJECTED)) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_ALREADY_CLOSED_OR_REJECTED_YOU_CANNOT_REPLY, null, null);
        }
        replyLogActivity(claimTicketReplyRequest, ticket, currentUser, ClaimTicketActivityEnum.REPLY_CUSTOMER.name());

    }

    /**
     * Logs an activity related to a ticket, such as a reply to the customer or an internal note.
     * Handles optional file attachments, saves them, and includes them in the activity log.
     *
     * @param claimTicketReplyRequest the reply request containing the message and optional attachments
     * @param ticket                  the ticket entity to which the activity pertains
     * @param currentUser             the user performing the activity
     * @param activityType            the type of activity being logged (e.g., reply to customer, internal note)
     */
    private void replyLogActivity(ClaimTicketReplyRequest claimTicketReplyRequest, ClaimTicket ticket, User currentUser, String activityType) {
        DocumentSourceEnum source = DocumentSourceEnum.CONVERSATION_ON_TICKET;
        // Handle attachments and save documents
        List<ClaimTicketDocument> claimTicketDocuments = uploadFileAttachments(claimTicketReplyRequest.getAttachments(), ticket, currentUser, source);
        // Save documents if any were uploaded
        Map<String, Object> attachments = new HashMap<>();
        if (!claimTicketDocuments.isEmpty()) {
            List<ClaimTicketDocument> savedDocuments = claimTicketDocumentRepository.saveAll(claimTicketDocuments);
            Set<ClaimTicketDocumentDTO> attachDocument = claimTicketMapper.toClaimTicketDocumentDTOs(savedDocuments);
            attachments.put(ATTACHMENTS, attachDocument);
        }

        ClaimTicketActivityLog activityLog = new ClaimTicketActivityLog();
        activityLog.setTicketId(ticket.getId());
        activityLog.setPerformedBy(currentUser.getId());
        Map<String, String> activityTitle = new HashMap<>();
        Map<String, String> linkedUser = new HashMap<>();
        Map<String, Object> activityDetail = new HashMap<>();
        activityLog.setActivityType(activityType);
        String msgOne = "ticket.activity.log.replied.with.attachment";
        String msgTwo = "ticket.activity.log.replied";
        if (activityType.equals(ClaimTicketActivityEnum.INTERNAL_NOTE_ADDED.name())) {
            msgOne = "ticket.activity.log.internal.note.added.with.attachment";
            msgTwo = "ticket.activity.log.internal.note.added";
        }
        if (!claimTicketDocuments.isEmpty()) {
            final String messageOne = msgOne;
            Arrays.stream(LanguageEnum.values()).forEach(language -> {
                String messageAudit = messageSource.getMessage(messageOne,
                    new Object[]{"@" + currentUser.getId(), "@" + ticket.getUserId()}, Locale.forLanguageTag(language.getCode()));
                activityTitle.put(language.getCode(), messageAudit);
            });
        } else {
            final String messageTwo = msgTwo;
            Arrays.stream(LanguageEnum.values()).forEach(language -> {
                String messageAudit = messageSource.getMessage(messageTwo,
                    new Object[]{"@" + currentUser.getId(), "@" + ticket.getUserId()}, Locale.forLanguageTag(language.getCode()));
                activityTitle.put(language.getCode(), messageAudit);
            });
        }
        activityDetail.put(Constants.PERFORM_BY, convertEntityToMap(claimTicketMapper.toUserDTO(currentUser)));
        activityDetail.put(Constants.TICKET_ID, ticket.getTicketId().toString());
        activityDetail.put("text", claimTicketReplyRequest.getMessage());
        linkedUser.put(currentUser.getId().toString(), currentUser.getFirstName());
        linkedUser.put(ticket.getUserId().toString(), ticket.getUser().getFirstName());

        activityLog.setActivityTitle(activityTitle);
        activityLog.setLinkedUsers(linkedUser);
        activityLog.setActivityDetails(activityDetail);
        activityLog.setAttachmentUrl(attachments);
        claimTicketActivityLogService.saveActivityLog(activityLog);
        this.sendReplyEmail(ticket, claimTicketReplyRequest, activityType, currentUser);
    }

    private List<ClaimTicketDocument> uploadFileAttachments(List<MultipartFile> attachments, ClaimTicket newClaimTicket, User currentUser, DocumentSourceEnum source) {
        List<ClaimTicketDocument> claimTicketDocuments = new ArrayList<>();
        // Handle file uploads and create documents
        if (!CollectionUtils.isEmpty(attachments)) {
            for (MultipartFile file : attachments) {
                try {
                    // Generate a unique file name for storage
                    String uniqueFileName = documentService.generateUniqueFileName(file.getOriginalFilename());
                    // Get the original file name, trimmed to fit within 255 characters and replace spaces with underscores
                    String originalFileName = documentService.fitFileNameToMaxLength(file.getOriginalFilename());
                    // Upload the document and get the external document ID
                    ResponseEntity<String> response = documentService.uploadDocument(file.getBytes(), String.valueOf(newClaimTicket.getTicketId()), uniqueFileName);
                    String externalDocumentId = response.getBody();  // Assuming the response body contains the externalDocumentId
                    // Create a ClaimTicketDocument and add to the list
                    ClaimTicketDocument claimTicketDocument = new ClaimTicketDocument();
                    claimTicketDocument.setClaimTicket(newClaimTicket);
                    claimTicketDocument.setExternalDocumentId(externalDocumentId);
                    claimTicketDocument.setTitle(uniqueFileName);  // Set the appropriate title (can customize as needed)
                    claimTicketDocument.setOriginalTitle(originalFileName);
                    claimTicketDocument.setInstanceType(newClaimTicket.getInstanceType());
                    claimTicketDocument.setSource(source);
                    claimTicketDocument.setInternal(IS_INTERNAL_DOCUMENT);
                    claimTicketDocument.setUploadedByUser(currentUser);
                    // Add the document to the list
                    claimTicketDocuments.add(claimTicketDocument);
                } catch (InvalidFileTypeException e) {
                    LOG.error("InvalidFileTypeException while uploadDocument:{}", e.getMessage());
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.FILE_STORAGE_ERROR, e.getMessage());
                } catch (FileStorageException e) {
                    LOG.error("Exception while uploadDocument:{}", e.getMessage());
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.FILE_STORAGE_ERROR, e.getMessage());
                } catch (IOException e) {
                    LOG.error("IOException while uploadDocument:{}", e.getMessage());
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.FILE_STORAGE_ERROR, e.getMessage());
                } catch (Exception e) {
                    String errorMessage = messageSource.getMessage("error.file.upload.unexpected", null, LocaleContextHolder.getLocale());
                    // Catch any other unexpected exceptions
                    throw new CustomException(Status.INTERNAL_SERVER_ERROR, SepsStatusCode.FILE_STORAGE_ERROR, errorMessage);
                }
            }
        }
        return claimTicketDocuments;
    }

    /**
     * Handles the logic for replying to an internal discussion on a ticket.
     * Validates the user's authority and ensures they are authorized to perform the action.
     * Logs the activity in the ticket history.
     *
     * @param ticketId                the ID of the ticket to which the internal reply is being made
     * @param claimTicketReplyRequest the reply request containing the message and optional attachments
     * @throws CustomException if the ticket is not found or the user is not authorized to perform this action
     */
    @Transactional
    public void replyToInternal(Long ticketId, @Valid ClaimTicketReplyRequest claimTicketReplyRequest) {
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();

        // Find the ticket by ID
        ClaimTicket ticket;
        if (authority.contains(AuthoritiesConstants.FI) && (currentUser.hasRoleSlug(Constants.RIGHTS_FI_ADMIN) || currentUser.hasRoleSlug(Constants.RIGHTS_FI_AGENT))) {
            Long organizationId = currentUser.getOrganization().getId();
            ticket = claimTicketRepository.findByIdAndOrganizationId(ticketId, organizationId)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        } else {
            ticket = claimTicketRepository.findById(ticketId)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        }
        if (currentUser.hasRoleSlug(Constants.RIGHTS_FI_AGENT) && !ticket.getFiAgentId().equals(currentUser.getId())) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.YOU_NOT_AUTHORIZED_TO_PERFORM, null, null);
        }
        if (ticket.getStatus().equals(ClaimTicketStatusEnum.CLOSED) || ticket.getStatus().equals(ClaimTicketStatusEnum.REJECTED)) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_ALREADY_CLOSED_OR_REJECTED_YOU_CANNOT_REPLY, null, null);
        }
        replyLogActivity(claimTicketReplyRequest, ticket, currentUser, ClaimTicketActivityEnum.INTERNAL_NOTE.name());
    }

    private void sendReplyEmail(ClaimTicket ticket, ClaimTicketReplyRequest claimTicketRejectRequest, String activityType, User currentUser) {
        Map<String, String> ticketDetail = new HashMap<>();
        ticketDetail.put("ticketNumber", ticket.getTicketId().toString());
        ticketDetail.put("senderName", currentUser.getFirstName());
        ticketDetail.put("messageContent", currentUser.getFirstName());
        ticketDetail.put("id", ticket.getId().toString());
        if (activityType.equals(ClaimTicketActivityEnum.REPLY_CUSTOMER.name())) {
            mailService.sendReplyToCustomerEmail(ticketDetail, claimTicketRejectRequest, ticket.getUser());
        }
    }

    @Transactional
    public void replyToInternalNote(Long ticketId, @Valid ClaimTicketReplyRequest claimTicketReplyRequest) {
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();

        // Find the ticket by ID
        ClaimTicket ticket;
        if (authority.contains(AuthoritiesConstants.FI) && (currentUser.hasRoleSlug(Constants.RIGHTS_FI_ADMIN) || currentUser.hasRoleSlug(Constants.RIGHTS_FI_AGENT))) {
            Long organizationId = currentUser.getOrganization().getId();
            ticket = claimTicketRepository.findByIdAndOrganizationId(ticketId, organizationId)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        } else {
            ticket = claimTicketRepository.findById(ticketId)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        }
        if (currentUser.hasRoleSlug(Constants.RIGHTS_FI_AGENT) && !ticket.getFiAgentId().equals(currentUser.getId())) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.YOU_NOT_AUTHORIZED_TO_PERFORM, null, null);
        }
        if (ticket.getStatus().equals(ClaimTicketStatusEnum.CLOSED) || ticket.getStatus().equals(ClaimTicketStatusEnum.REJECTED)) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_ALREADY_CLOSED_OR_REJECTED_YOU_CANNOT_REPLY, null, null);
        }
        replyLogActivity(claimTicketReplyRequest, ticket, currentUser, ClaimTicketActivityEnum.INTERNAL_NOTE_ADDED.name());
    }

    @Transactional
    public Map<String, String> getSepsFiClaimTicketByIdTest(Long id) {
        ClaimTicketDTO claimTicket = this.getSepsFiClaimTicketById((id));
        User user = userService.getCurrentUser();

        MailDTO mailDTO = new MailDTO();
        mailDTO.setTemplateId(28L);
        mailDTO.setTo(user.getEmail());
        mailDTO.setLocale(user.getLangKey());
        mailDTO.setIsStatic(false);
        mailDTO.setDataVariables(templateVariableMappingService.mapVariables(claimTicket, user));
        mailService.sendDynamicContentEmail(mailDTO);

        return templateVariableMappingService.mapVariables(claimTicket, user);

    }

    /**
     * Triggers the priority workflow for a given claim ticket.
     *
     * <p>This method identifies the appropriate workflow actions for the specified claim ticket
     * based on its priority, organization, and instance type. It performs the following:
     * <ul>
     *   <li>Retrieves the associated workflow details.</li>
     *   <li>Performs actions like sending emails to customers or agents as defined in the workflow.</li>
     *   <li>Logs workflow failures, if any, and updates the workflow data in the database.</li>
     * </ul>
     *
     * @param claimTicketId the ID of the claim ticket to process.
     * @throws NullPointerException if the claim ticket is not found.
     */
    @Async
    @Transactional
    public void triggerPriorityWorkflow(Long claimTicketId){

        ClaimTicket claimTicket = claimTicketRepository.findById(claimTicketId).orElse(null);
        if(claimTicket!=null) {
            ClaimTicketDTO claimTicketDTO = claimTicketMapper.toDTO(claimTicket);
            ClaimTicketWorkFlowDTO claimTicketWorkFlowDTO = claimTicketWorkFlowService.findPriorityWorkFlow(claimTicketDTO.getOrganizationId(), claimTicketDTO.getInstanceType(),
                claimTicketDTO.getPriority());

            if (claimTicketWorkFlowDTO != null) {
                for (TicketPriorityAction priorityAction : claimTicketWorkFlowDTO.getTicketPriorityActions()) {
                    Long agentId = priorityAction.getAgentId();
                    Long templateId = priorityAction.getTemplateId();

                    if(templateValidate(templateId, claimTicketWorkFlowDTO.getId(),priorityAction.getAction().name()))
                        continue;

                    User user = null;
                    switch (priorityAction.getAction()) {
                        case MAIL_TO_CUSTOMER:
                            user = findCustomer(claimTicketDTO.getUserId(), claimTicketWorkFlowDTO.getId(),priorityAction.getAction().name());
                            break;
                        case MAIL_TO_FI_TEAM:
                            user = findAgent(agentId, claimTicketWorkFlowDTO, priorityAction.getAction().name(), UserTypeEnum.FI_USER);
                            break;
                        case MAIL_TO_FI_AGENT:
                            user = findAgent(claimTicketDTO.getFiAgentId(), claimTicketWorkFlowDTO, priorityAction.getAction().name(), UserTypeEnum.FI_USER);
                            break;
                        case MAIL_TO_SEPS_TEAM:
                            user = findAgent(agentId, claimTicketWorkFlowDTO, priorityAction.getAction().name(), UserTypeEnum.SEPS_USER);
                            break;
                        case MAIL_TO_SEPS_AGENT:
                            user = findAgent(claimTicketDTO.getSepsAgentId(), claimTicketWorkFlowDTO, priorityAction.getAction().name(), UserTypeEnum.SEPS_USER);
                            break;
                        // Add other cases if needed
                        default:
                            // Handle unsupported actions or log them
                            break;
                    }
                    mailService.workflowEmailSend(templateId, claimTicketDTO, user);
                }
                savePriorityWorkFlowData(claimTicketId, claimTicketWorkFlowDTO);
            } else {
                User user = userService.findUserById(claimTicketDTO.getUpdatedBy());
                this.sendPriorityChangeEmail(claimTicket, claimTicketDTO.getPriority(), user);
            }
        }
    }

    /**
     * Saves the priority workflow data for a given claim ticket.
     *
     * <p>This method updates the {@code ClaimTicketPriorityLog} entity with workflow details
     * and logs the workflow actions performed for the ticket.
     *
     * @param claimTicketId the ID of the claim ticket to update.
     * @param claimTicketWorkFlowDTO the workflow data to save.
     */
    @Transactional
    public void savePriorityWorkFlowData(Long claimTicketId, ClaimTicketWorkFlowDTO claimTicketWorkFlowDTO){
        ClaimTicketPriorityLog claimTicketPriority = claimTicketPriorityLogRepository.findFirstByTicketIdOrderByCreatedAtDesc(claimTicketId).orElse(null);
        if(claimTicketPriority!=null){
            claimTicketPriority.setClaimTicketWorkFlowId(claimTicketWorkFlowDTO.getId());
            claimTicketPriority.setClaimTicketWorkFlowData(gson.toJson(claimTicketWorkFlowDTO));
            claimTicketPriorityLogRepository.save(claimTicketPriority);
        }
    }

    private boolean templateValidate(Long templateId, Long workflowId, String action){
        boolean result = true;
        if (templateId != null) {
            TemplateMaster templateMaster = templateMasterRepository.findByIdAndStatus(templateId, true).orElse(null);
            if (templateMaster == null) {
                claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.template.not.found",
                    new Object[]{templateId}, null, templateId);
            } else {
                result = false;
            }
        } else {
            claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.template.id.null",
                new Object[]{action}, null, null);
        }
        return result;
    }

    private User findCustomer(Long customerId, Long workflowId, String action){
        User user = null;
        if (customerId == null) {
            claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.customer.id.null",
                new Object[]{action}, null, null);
        }else {
            user = userService.findUserById(customerId);
            if (user == null) {
                claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.customer.not.found",
                    new Object[]{customerId}, customerId, null);
            }
        }
        return user;
    }

    private User findAgent(Long agentId, ClaimTicketWorkFlowDTO claimTicketWorkFlowDTO, String action, UserTypeEnum userType){
        User user = null;
        if (agentId == null) {
            claimTicketWorkFlowService.logWorkflowFailure(claimTicketWorkFlowDTO.getId(), "workflow.agent.id.null", new Object[]{action}, null, null);
        }else{
            user = userType.equals(UserTypeEnum.FI_USER) ? claimTicketWorkFlowService.findFIUserForMailAction(agentId, claimTicketWorkFlowDTO) :
                claimTicketWorkFlowService.findSEPSUserForMailAction(agentId, claimTicketWorkFlowDTO);
            if (user == null) {
                claimTicketWorkFlowService.logWorkflowFailure(claimTicketWorkFlowDTO.getId(), "workflow.user.not.found", new Object[]{agentId}, agentId, null);
            }
        }
        return user;
    }

    /**
     * Updates the status of a claim ticket.
     *
     * <p>This method changes the status of a claim ticket, logs the status change in the
     * activity log and status log tables, and performs necessary validations to prevent
     * redundant updates.
     *
     * @param ticketId the ID of the claim ticket to update.
     * @param status the new status to set for the claim ticket.
     * @param requestInfo the request information for audit logging.
     * @throws CustomException if the claim ticket is not found or already in the specified status.
     */
    @Transactional
    public void updateTicketStatus(Long ticketId, ClaimTicketStatusEnum status, RequestInfo requestInfo) {
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
        if (ticket.getStatus().equals(status)) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_ALREADY_IN_STATUS, new String[]{enumUtil.getLocalizedEnumValue(status, LocaleContextHolder.getLocale())}, null);
        }
        Map<String, Object> oldData = convertEntityToMap(this.getSepsFiClaimTicketById(ticketId));
        ClaimTicketActivityLog activityLog = createStatusChangeActivityLog(currentUser, ticket, status);
        ticket.setStatus(status);
        ticket.setUpdatedBy(currentUser.getId());

        // Save the updated ticket
        ClaimTicket savedTicket = claimTicketRepository.save(ticket);
        claimTicketActivityLogService.saveActivityLog(activityLog);

        //Save ClaimTicketStatusLog table
        ClaimTicketStatusLog claimTicketStatusLog = new ClaimTicketStatusLog();
        claimTicketStatusLog.setTicketId(ticket.getId());
        claimTicketStatusLog.setStatus(status);
        claimTicketStatusLog.setInstanceType(ticket.getInstanceType());
        claimTicketStatusLog.setCreatedBy(currentUser.getId());
        claimTicketStatusLogRepository.save(claimTicketStatusLog);

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.ticket.change.status",
                new Object[]{currentUser.getEmail(), String.valueOf(ticket.getTicketId()), enumUtil.getLocalizedEnumValue(status, Locale.forLanguageTag(language.getCode()))}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });

        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getSepsFiClaimTicketById(savedTicket.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        Map<String, Object> req = new HashMap<>();
        req.put("status", status.name());
        String requestBody = gson.toJson(req);
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "updateTicketStatus", ActionTypeEnum.CLAIM_TICKET_CHANGED_STATUS.name(), savedTicket.getId(), ClaimTicket.class.getSimpleName(),
            null, auditMessageMap, entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);

    }

    private ClaimTicketActivityLog createStatusChangeActivityLog(User currentUser, ClaimTicket ticket, ClaimTicketStatusEnum status) {

        ClaimTicketActivityLog activityLog = new ClaimTicketActivityLog();
        activityLog.setTicketId(ticket.getId());
        activityLog.setPerformedBy(currentUser.getId());
        Map<String, String> activityTitle = new HashMap<>();
        Map<String, String> linkedUser = new HashMap<>();
        Map<String, Object> activityDetail = new HashMap<>();
        activityLog.setActivityType(ClaimTicketActivityEnum.STATUS_CHANGED.name());
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("ticket.activity.log.ticket.change.status",
                new Object[]{"@" + currentUser.getId(), enumUtil.getLocalizedEnumValue(status, Locale.forLanguageTag(language.getCode()))}, Locale.forLanguageTag(language.getCode()));
            activityTitle.put(language.getCode(), messageAudit);
        });
        activityDetail.put(Constants.PERFORM_BY, convertEntityToMap(claimTicketMapper.toUserDTO(currentUser)));
        activityDetail.put(Constants.TICKET_ID, ticket.getTicketId().toString());
        linkedUser.put(currentUser.getId().toString(), currentUser.getFirstName());
        activityLog.setActivityTitle(activityTitle);
        activityLog.setLinkedUsers(linkedUser);
        activityLog.setActivityDetails(activityDetail);
        return activityLog;
    }

    /**
     * Triggers the status change workflow for a given claim ticket.
     *
     * <p>This method identifies the workflow actions to be executed when the status of a claim
     * ticket changes. It performs the following:
     * <ul>
     *   <li>Retrieves the associated workflow details based on the ticket's status.</li>
     *   <li>Performs actions like sending emails to customers or agents as defined in the workflow.</li>
     *   <li>Logs workflow failures, if any.</li>
     * </ul>
     *
     * @param claimTicketId the ID of the claim ticket whose status has changed.
     * @throws NullPointerException if the claim ticket is not found.
     */
    @Async
    @Transactional
    public void triggerChangeStatusWorkflow(Long claimTicketId){

        ClaimTicket claimTicket = claimTicketRepository.findById(claimTicketId).orElse(null);
        if(claimTicket!=null) {
            ClaimTicketDTO claimTicketDTO = claimTicketMapper.toDTO(claimTicket);
            ClaimTicketWorkFlowDTO claimTicketWorkFlowDTO = claimTicketWorkFlowService.findTicketStatusWorkFlow(claimTicketDTO.getOrganizationId(), claimTicketDTO.getInstanceType(),
                claimTicketDTO.getStatus());

            if (claimTicketWorkFlowDTO != null) {
                for (TicketStatusAction statusAction : claimTicketWorkFlowDTO.getTicketStatusActions()) {
                    Long agentId = statusAction.getAgentId();
                    Long templateId = statusAction.getTemplateId();

                    if(templateValidate(templateId, claimTicketWorkFlowDTO.getId(),statusAction.getAction().name()))
                        continue;

                    User user = null;
                    switch (statusAction.getAction()) {
                        case MAIL_TO_CUSTOMER:
                            user = findCustomer(claimTicketDTO.getUserId(), claimTicketWorkFlowDTO.getId(),statusAction.getAction().name());
                            break;
                        case MAIL_TO_FI_TEAM:
                            user = findAgent(agentId, claimTicketWorkFlowDTO, statusAction.getAction().name(), UserTypeEnum.FI_USER);
                            break;
                        case MAIL_TO_FI_AGENT:
                            user = findAgent(claimTicketDTO.getFiAgentId(), claimTicketWorkFlowDTO, statusAction.getAction().name(), UserTypeEnum.FI_USER);
                            break;
                        case MAIL_TO_SEPS_TEAM:
                            user = findAgent(agentId, claimTicketWorkFlowDTO, statusAction.getAction().name(), UserTypeEnum.SEPS_USER);
                            break;
                        case MAIL_TO_SEPS_AGENT:
                            user = findAgent(claimTicketDTO.getSepsAgentId(), claimTicketWorkFlowDTO, statusAction.getAction().name(), UserTypeEnum.SEPS_USER);
                            break;
                        // Add other cases if needed
                        default:
                            // Handle unsupported actions or log them
                            break;
                    }
                    mailService.workflowEmailSend(templateId, claimTicketDTO, user);
                }
                saveChangeStatusWorkFlowData(claimTicketId, claimTicketWorkFlowDTO);
            } else {
                LOG.info("Default change status email execute.");
                this.sendStatusChangeEmail(claimTicketDTO);
            }
        }
    }

    @Transactional
    public void saveChangeStatusWorkFlowData(Long claimTicketId, ClaimTicketWorkFlowDTO claimTicketWorkFlowDTO){
        ClaimTicketStatusLog claimTicketStatus = claimTicketStatusLogRepository.findFirstByTicketIdOrderByCreatedAtDesc(claimTicketId).orElse(null);
        if(claimTicketStatus!=null){
            claimTicketStatus.setClaimTicketWorkFlowId(claimTicketWorkFlowDTO.getId());
            claimTicketStatus.setClaimTicketWorkFlowData(gson.toJson(claimTicketWorkFlowDTO));
            claimTicketStatusLogRepository.save(claimTicketStatus);
        }
    }

    private void sendStatusChangeEmail(ClaimTicketDTO ticket) {

        // Send email to the Customer
        if (ticket.getUserId() != null) {
            User customer = userService.getUserById(ticket.getUserId());
            mailService.sendStatusChangeEmail(ticket, customer);
        }
    }
}
