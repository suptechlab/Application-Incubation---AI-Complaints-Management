package com.seps.ticket.service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.seps.ticket.config.Constants;
import com.seps.ticket.config.InstantTypeAdapter;
import com.seps.ticket.domain.Authority;
import com.seps.ticket.domain.ClaimTicketWorkFlow;
import com.seps.ticket.domain.Organization;
import com.seps.ticket.domain.User;
import com.seps.ticket.enums.ActionTypeEnum;
import com.seps.ticket.enums.ActivityTypeEnum;
import com.seps.ticket.enums.LanguageEnum;
import com.seps.ticket.repository.ClaimTicketWorkFlowRepository;
import com.seps.ticket.repository.OrganizationRepository;
import com.seps.ticket.security.AuthoritiesConstants;
import com.seps.ticket.service.dto.RequestInfo;
import com.seps.ticket.service.dto.workflow.*;
import com.seps.ticket.service.mapper.ClaimTicketWorkFlowMapper;
import com.seps.ticket.service.specification.ClaimTicketWorkFlowSpecification;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
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
import java.util.*;

import static com.seps.ticket.component.CommonHelper.convertEntityToMap;

@Service
public class ClaimTicketWorkFlowService {
    private static final Logger LOG = LoggerFactory.getLogger(ClaimTicketWorkFlowService.class);

    private final UserService userService;
    private final ClaimTicketWorkFlowRepository claimTicketWorkFlowRepository;
    private final OrganizationRepository organizationRepository;
    private final ClaimTicketWorkFlowMapper claimTicketWorkFlowMapper;
    private final MessageSource messageSource;
    private final Gson gson;
    private final AuditLogService auditLogService;

    public ClaimTicketWorkFlowService(UserService userService, ClaimTicketWorkFlowRepository claimTicketWorkFlowRepository,
                                      OrganizationRepository organizationRepository, ClaimTicketWorkFlowMapper claimTicketWorkFlowMapper,
                                      MessageSource messageSource, AuditLogService auditLogService) {
        this.userService = userService;
        this.claimTicketWorkFlowRepository = claimTicketWorkFlowRepository;
        this.organizationRepository = organizationRepository;
        this.claimTicketWorkFlowMapper = claimTicketWorkFlowMapper;
        this.messageSource = messageSource;
        this.gson = new GsonBuilder()
            .registerTypeAdapter(Instant.class, new InstantTypeAdapter())
            .create();
        this.auditLogService = auditLogService;
    }

    /**
     * Adds a new claim ticket workflow.
     *
     * @param claimTicketWorkFlowDTO The data transfer object containing the information for the new claim ticket workflow.
     * @param requestInfo            Information about the request.
     * @return The ID of the newly created claim ticket workflow.
     * @throws CustomException If the user doesn't have access to the organization or if the workflow creation fails.
     */
    @Transactional
    public Long addClaimTicketWorkFlow(ClaimTicketWorkFlowDTO claimTicketWorkFlowDTO, RequestInfo requestInfo) {
        LOG.debug("ticket work flow:{}", claimTicketWorkFlowDTO);
        User currentUser = userService.getCurrentUser();
        Long organizationId = resolveOrganizationId(claimTicketWorkFlowDTO.getOrganizationId(), currentUser);
        Organization organization = findOrganization(organizationId);
        // Map DTO to Entity
        ClaimTicketWorkFlow claimTicketWorkFlow = mapDTOToEntity(claimTicketWorkFlowDTO, currentUser, organization);
        claimTicketWorkFlowRepository.save(claimTicketWorkFlow);
        //Audit Log
        Map<String, String> auditMessageMap = new HashMap<>();
        Map<String, Object> entityData = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.claim.ticket.work.flow.created",
                new Object[]{currentUser.getEmail(), claimTicketWorkFlow.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        entityData.put(Constants.NEW_DATA, convertEntityToMap(claimTicketWorkFlowMapper.mapEntityToDTO(claimTicketWorkFlow)));
        String requestBody = gson.toJson(claimTicketWorkFlowDTO);
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "addClaimTicketWorkFlow",
            ActionTypeEnum.CLAIM_TICKET_WORK_FLOW_ADD.name(), claimTicketWorkFlow.getId(), ClaimTicketWorkFlow.class.getSimpleName(),
            null, auditMessageMap, entityData, ActivityTypeEnum.DATA_ENTRY.name(), requestBody);
        return claimTicketWorkFlow.getId();
    }

    /**
     * Resolves the organization ID for the current user based on their authorities.
     *
     * @param organizationId The ID of the organization provided in the request.
     * @param currentUser    The current logged-in user.
     * @return The resolved organization ID.
     */
    private Long resolveOrganizationId(Long organizationId, User currentUser) {
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        if (authority.contains(AuthoritiesConstants.FI)) {
            organizationId = currentUser.getOrganizationId();
        }
        return organizationId;
    }

    /**
     * Finds an organization by its ID.
     *
     * @param organizationId The ID of the organization.
     * @return The organization associated with the given ID.
     * @throws CustomException If the organization cannot be found.
     */
    private Organization findOrganization(Long organizationId) {
        return organizationRepository.findById(organizationId)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.ORGANIZATION_NOT_FOUND, null, null));
    }

    /**
     * Maps a DTO to an entity for the claim ticket workflow.
     *
     * @param dto          The claim ticket workflow DTO.
     * @param currentUser  The current logged-in user.
     * @param organization The organization associated with the workflow.
     * @return The corresponding ClaimTicketWorkFlow entity.
     */
    private ClaimTicketWorkFlow mapDTOToEntity(ClaimTicketWorkFlowDTO dto, User currentUser, Organization organization) {
        ClaimTicketWorkFlow entity = new ClaimTicketWorkFlow();
        entity.setOrganization(organization);
        entity.setInstanceType(dto.getInstanceType());
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setEvent(dto.getEvent());
        // Serialize the conditions and actions directly into JSON and set on the entity
        Gson gson = new Gson();
        switch (dto.getEvent()) {
            case CREATED:
                entity.setConditions(gson.toJson(dto.getCreateConditions()));  // Serialize conditions
                entity.setActions(gson.toJson(dto.getCreateActions()));        // Serialize actions
                break;
            case TICKET_STATUS:
                entity.setConditions(gson.toJson(dto.getTicketStatusConditions()));
                entity.setActions(gson.toJson(dto.getTicketStatusActions()));
                break;
            case TICKET_PRIORITY:
                entity.setConditions(gson.toJson(dto.getTicketPriorityConditions()));
                entity.setActions(gson.toJson(dto.getTicketPriorityActions()));
                break;
            case SLA_DAYS_REMINDER:
                entity.setConditions(gson.toJson(dto.getSlaDaysReminderConditions()));
                entity.setActions(gson.toJson(dto.getSlaDaysReminderActions()));
                break;
            case SLA_BREACH:
                entity.setActions(gson.toJson(dto.getSlaBreachActions()));
                break;
            case TICKET_DATE_EXTENSION:
                entity.setActions(gson.toJson(dto.getTicketDateExtensionActions()));
                break;
            default:
                LOG.warn("Unrecognized event mapDTOToEntity: {}", dto.getEvent());
                break;
        }
        entity.setCreatedByUser(currentUser);
        entity.setStatus(true);
        return entity;
    }


    /**
     * Fetches a claim ticket workflow by its ID.
     *
     * @param id The ID of the claim ticket workflow.
     * @return The DTO representation of the claim ticket workflow.
     * @throws CustomException If the claim ticket workflow is not found or the user doesn't have access to it.
     */
    @Transactional(readOnly = true)
    public ClaimTicketWorkFlowDTO getClaimTicketWorkFlowById(Long id) {
        LOG.debug("Fetching claim ticket workflow by ID: {}", id);
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        Long organizationId = null;
        if (authority.contains(AuthoritiesConstants.FI)) {
            organizationId = currentUser.getOrganization().getId();
        }
        ClaimTicketWorkFlow claimTicketWorkFlow;
        if (organizationId != null) {
            claimTicketWorkFlow = claimTicketWorkFlowRepository.findByIdAndOrganizationId(id, organizationId)
                .orElseThrow(() -> new CustomException(Status.NOT_FOUND, SepsStatusCode.CLAIM_TICKET_WORKFLOW_NOT_FOUND, null, null));
            // Map the entity to the DTO
        } else {
            claimTicketWorkFlow = claimTicketWorkFlowRepository.findById(id)
                .orElseThrow(() -> new CustomException(Status.NOT_FOUND, SepsStatusCode.CLAIM_TICKET_WORKFLOW_NOT_FOUND, null, null));
            // Map the entity to the DTO
        }
        return claimTicketWorkFlowMapper.mapEntityToDTO(claimTicketWorkFlow);
    }

    /**
     * Updates an existing claim ticket workflow.
     *
     * @param id                     The ID of the claim ticket workflow to update.
     * @param claimTicketWorkflowDTO The updated claim ticket workflow data.
     * @param requestInfo            Information about the request.
     * @throws CustomException If the claim ticket workflow is not found or the user doesn't have access to it.
     */
    @Transactional
    public void updateClaimTicketWorkFlow(Long id, @Valid ClaimTicketWorkFlowDTO claimTicketWorkflowDTO, RequestInfo requestInfo) {
        LOG.debug("Updating ticket workflow: {}", claimTicketWorkflowDTO);
        User currentUser = userService.getCurrentUser();
        Long organizationId = resolveOrganizationId(claimTicketWorkflowDTO.getOrganizationId(), currentUser);
        ClaimTicketWorkFlow existingWorkflow = claimTicketWorkFlowRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.NOT_FOUND, SepsStatusCode.CLAIM_TICKET_WORKFLOW_NOT_FOUND, null, null));
        if (!existingWorkflow.getOrganization().getId().equals(organizationId)) {
            throw new CustomException(Status.FORBIDDEN, SepsStatusCode.CLAIM_TICKET_WORKFLOW_NOT_FOUND, null, null);
        }
        Map<String, Object> oldData = convertEntityToMap(claimTicketWorkFlowMapper.mapEntityToDTO(existingWorkflow));
        // Update entity fields
        existingWorkflow.setInstanceType(claimTicketWorkflowDTO.getInstanceType());
        existingWorkflow.setTitle(claimTicketWorkflowDTO.getTitle());
        existingWorkflow.setDescription(claimTicketWorkflowDTO.getDescription());
        existingWorkflow.setEvent(claimTicketWorkflowDTO.getEvent());
        existingWorkflow.setUpdatedByUser(currentUser);
        // Update conditions and actions based on the event
        switch (claimTicketWorkflowDTO.getEvent()) {
            case CREATED:
                existingWorkflow.setConditions(gson.toJson(claimTicketWorkflowDTO.getCreateConditions()));
                existingWorkflow.setActions(gson.toJson(claimTicketWorkflowDTO.getCreateActions()));
                break;
            case TICKET_STATUS:
                existingWorkflow.setConditions(gson.toJson(claimTicketWorkflowDTO.getTicketStatusConditions()));
                existingWorkflow.setActions(gson.toJson(claimTicketWorkflowDTO.getTicketStatusActions()));
                break;
            case TICKET_PRIORITY:
                existingWorkflow.setConditions(gson.toJson(claimTicketWorkflowDTO.getTicketPriorityConditions()));
                existingWorkflow.setActions(gson.toJson(claimTicketWorkflowDTO.getTicketPriorityActions()));
                break;
            case SLA_DAYS_REMINDER:
                existingWorkflow.setConditions(gson.toJson(claimTicketWorkflowDTO.getSlaDaysReminderConditions()));
                existingWorkflow.setActions(gson.toJson(claimTicketWorkflowDTO.getSlaDaysReminderActions()));
                break;
            case SLA_BREACH:
                existingWorkflow.setActions(gson.toJson(claimTicketWorkflowDTO.getSlaBreachActions()));
                break;
            case TICKET_DATE_EXTENSION:
                existingWorkflow.setActions(gson.toJson(claimTicketWorkflowDTO.getTicketDateExtensionActions()));
                break;
            default:
                LOG.warn("Unrecognized event updateClaimTicketWorkFlow: {}", claimTicketWorkflowDTO.getEvent());
                break;
        }
        claimTicketWorkFlowRepository.save(existingWorkflow);

        //Audit Log Data
        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.claim.ticket.work.flow.updated",
                new Object[]{currentUser.getEmail(), existingWorkflow.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(claimTicketWorkFlowMapper.mapEntityToDTO(existingWorkflow));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        String requestBody = gson.toJson(claimTicketWorkflowDTO);
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "updateClaimTicketWorkFlow",
            ActionTypeEnum.CLAIM_TICKET_WORK_FLOW_EDIT.name(), existingWorkflow.getId(), ClaimTicketWorkFlow.class.getSimpleName(),
            null, auditMessageMap, entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);
    }

    /**
     * Lists claim ticket workflows with pagination and filtering.
     *
     * @param pageable Pagination information.
     * @param search   A search string for filtering the workflows.
     * @param status   The status of the workflows to filter by.
     * @return A paginated list of claim ticket workflows matching the given filters.
     */
    @Transactional(readOnly = true)
    public Page<ClaimTicketWorkFlowDTO> listClaimTicketWorkFlows(Pageable pageable, String search, Boolean status) {
        User currentUser = userService.getCurrentUser();
        Long organizationId = validateOrganizationAccess(currentUser);
        return claimTicketWorkFlowRepository.findAll(ClaimTicketWorkFlowSpecification.byFilter(search, status, organizationId), pageable).map(claimTicketWorkFlowMapper::mapEntityToDTO);
    }

    /**
     * Validates if the current user has access to an organization.
     *
     * @param currentUser The current logged-in user.
     * @return The organization ID if the user has access.
     * @throws CustomException If the user does not have valid access to the organization.
     */
    private Long validateOrganizationAccess(User currentUser) {
        List<String> authorities = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        if (authorities.contains(AuthoritiesConstants.FI)) {
            Long organizationId = currentUser.getOrganizationId();
            if (organizationId == null) {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.SOMETHING_GOES_WRONG, null, null);
            }
            return organizationId;
        }
        return null;
    }
}
