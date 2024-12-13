package com.seps.ticket.service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import com.seps.ticket.domain.Authority;
import com.seps.ticket.domain.ClaimTicketWorkFlow;
import com.seps.ticket.domain.Organization;
import com.seps.ticket.domain.User;
import com.seps.ticket.repository.ClaimTicketWorkFlowRepository;
import com.seps.ticket.repository.OrganizationRepository;
import com.seps.ticket.security.AuthoritiesConstants;
import com.seps.ticket.service.dto.workflow.*;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

import java.util.List;

@Service
public class ClaimTicketWorkFlowService {

    private static final Logger LOG = LoggerFactory.getLogger(ClaimTicketWorkFlowService.class);

    private final UserService userService;

    private final ClaimTicketWorkFlowRepository claimTicketWorkFlowRepository;

    private final OrganizationRepository organizationRepository;

    public ClaimTicketWorkFlowService(UserService userService, ClaimTicketWorkFlowRepository claimTicketWorkFlowRepository, OrganizationRepository organizationRepository) {
        this.userService = userService;
        this.claimTicketWorkFlowRepository = claimTicketWorkFlowRepository;
        this.organizationRepository = organizationRepository;
    }

    @Transactional
    public Long createClaimTicketWorkFlow(ClaimTicketWorkFlowDTO claimTicketWorkflowDTO) {
        LOG.debug("ticket work flow:{}", claimTicketWorkflowDTO);
        User currentUser = userService.getCurrentUser();
        Long organizationId = resolveOrganizationId(claimTicketWorkflowDTO, currentUser);
        Organization organization = findOrganization(organizationId);
        // Map DTO to Entity
        ClaimTicketWorkFlow claimTicketWorkFlow = mapDTOToEntity(claimTicketWorkflowDTO, currentUser, organization);
        claimTicketWorkFlowRepository.save(claimTicketWorkFlow);
        return claimTicketWorkFlow.getId();
    }

    private Long resolveOrganizationId(ClaimTicketWorkFlowDTO claimTicketWorkflowDTO, User currentUser) {
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        Long organizationId = claimTicketWorkflowDTO.getOrganizationId();
        if (authority.contains(AuthoritiesConstants.FI)) {
            organizationId = currentUser.getOrganizationId();
        }
        return organizationId;
    }


    private Organization findOrganization(Long organizationId) {
        return organizationRepository.findById(organizationId)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.ORGANIZATION_NOT_FOUND, null, null));
    }

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


    @Transactional
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
        return mapEntityToDTO(claimTicketWorkFlow);
    }

    private ClaimTicketWorkFlowDTO mapEntityToDTO(ClaimTicketWorkFlow entity) {
        ClaimTicketWorkFlowDTO dto = new ClaimTicketWorkFlowDTO();
        dto.setId(entity.getId());
        dto.setOrganizationId(entity.getOrganization().getId());
        dto.setInstanceType(entity.getInstanceType());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setEvent(entity.getEvent());
        dto.setStatus(entity.getStatus());
        // Deserialize conditions and actions from JSON
        Gson gson = new GsonBuilder()
            .create();

        switch (entity.getEvent()) {
            case CREATED:
                dto.setCreateConditions(gson.fromJson(entity.getConditions(), new TypeToken<List<CreateCondition>>() {
                }.getType()));
                dto.setCreateActions(gson.fromJson(entity.getActions(), new TypeToken<List<CreateAction>>() {
                }.getType()));
                break;
            case TICKET_STATUS:
                dto.setTicketStatusConditions(gson.fromJson(entity.getConditions(), new TypeToken<List<TicketStatusCondition>>() {
                }.getType()));
                dto.setTicketStatusActions(gson.fromJson(entity.getActions(), new TypeToken<List<TicketStatusAction>>() {
                }.getType()));
                break;
            case TICKET_PRIORITY:
                dto.setTicketPriorityConditions(gson.fromJson(entity.getConditions(), new TypeToken<List<TicketPriorityCondition>>() {
                }.getType()));
                dto.setTicketPriorityActions(gson.fromJson(entity.getActions(), new TypeToken<List<TicketPriorityAction>>() {
                }.getType()));
                break;
            case SLA_DAYS_REMINDER:
                dto.setSlaDaysReminderConditions(gson.fromJson(entity.getConditions(), new TypeToken<List<SLADaysReminderCondition>>() {
                }.getType()));
                dto.setSlaDaysReminderActions(gson.fromJson(entity.getActions(), new TypeToken<List<SLADaysReminderAction>>() {
                }.getType()));
                break;
            case SLA_BREACH:
                dto.setSlaBreachActions(gson.fromJson(entity.getActions(), new TypeToken<List<SLABreachAction>>() {
                }.getType()));
                break;
            case TICKET_DATE_EXTENSION:
                dto.setTicketDateExtensionActions(gson.fromJson(entity.getActions(), new TypeToken<List<TicketDateExtensionAction>>() {
                }.getType()));
                break;
            default:
                LOG.warn("Unrecognized event mapEntityToDTO: {}", entity.getEvent());
                break;
        }
        return dto;
    }
}
