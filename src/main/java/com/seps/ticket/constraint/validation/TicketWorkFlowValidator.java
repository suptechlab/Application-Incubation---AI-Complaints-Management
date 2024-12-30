package com.seps.ticket.constraint.validation;

import com.seps.ticket.domain.Authority;
import com.seps.ticket.domain.Team;
import com.seps.ticket.domain.TemplateMaster;
import com.seps.ticket.domain.User;
import com.seps.ticket.enums.ClaimTicketStatusEnum;
import com.seps.ticket.enums.InstanceTypeEnum;
import com.seps.ticket.security.AuthoritiesConstants;
import com.seps.ticket.service.TeamService;
import com.seps.ticket.service.TemplateMasterService;
import com.seps.ticket.service.UserService;
import com.seps.ticket.service.dto.workflow.*;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;

import java.util.List;

public class TicketWorkFlowValidator implements ConstraintValidator<TicketWorkFlowCondition, ClaimTicketWorkFlowDTO> {

    private static final Logger LOG = LoggerFactory.getLogger(TicketWorkFlowValidator.class);

    private final MessageSource messageSource;

    private final TemplateMasterService templateMasterService;

    private final UserService userService;

    private final TeamService teamService;

    // Constants for literals
    private static final String CREATE_ACTIONS = "createActions";
    private static final String TICKET_STATUS_ACTIONS = "ticketStatusActions";
    private static final String TICKET_PRIORITY_ACTIONS = "ticketPriorityActions";
    private static final String SLA_DAYS_REMINDER_ACTIONS = "slaDaysReminderActions";
    private static final String SLA_BREACH_ACTIONS = "slaBreachActions";
    private static final String TICKET_DATE_EXTENSION_ACTIONS = "ticketDateExtensionActions";
    private static final String NOT_NULL = "not.null";
    private static final String TEAM_ID = ".teamId";
    private static final String AGENT_ID = ".agentId";
    private static final String TEMPLATE_ID = ".templateId";
    private static final String NOT_EMPTY = "not.empty";
    private static final String ACTION = ".action";
    private static final String ACTION_FORMAT = "%s[%d]";
    private static final String NOT_FOUND = "not.found";

    public TicketWorkFlowValidator(MessageSource messageSource, TemplateMasterService templateMasterService, UserService userService, TeamService teamService) {
        this.messageSource = messageSource;
        this.templateMasterService = templateMasterService;
        this.userService = userService;
        this.teamService = teamService;
    }

    @Override
    public void initialize(TicketWorkFlowCondition constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(ClaimTicketWorkFlowDTO dto, ConstraintValidatorContext context) {
        boolean isValid = true;

        User currentUser = userService.getCurrentUser();
        List<String> authorities = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();

        if (dto.getInstanceType() != null && dto.getInstanceType().equals(InstanceTypeEnum.FIRST_INSTANCE)) {
            if (dto.getOrganizationId() == null) {
                isValid = addValidationMessage("organizationId", NOT_NULL, context) && isValid;
            }
        }

        if (authorities.contains(AuthoritiesConstants.FI)) {
            if (dto.getInstanceType() != null && !(dto.getInstanceType().equals(InstanceTypeEnum.FIRST_INSTANCE))) {
                isValid = addValidationMessage("instanceType", "workflow.invalid.instance.type.fi", context) && isValid;
            }
            if (dto.getOrganizationId() == null) {
                isValid = addValidationMessage("organizationId", NOT_NULL, context) && isValid;
            } else {
                if (dto.getOrganizationId() != currentUser.getOrganizationId()) {
                    isValid = addValidationMessage("organizationId", NOT_FOUND, context) && isValid;
                }
            }
        }

        if (!isValid) {
            return false;
        }

        switch (dto.getEvent()) {
            case CREATED:
                isValid = validateCreateEvent(dto, context);
                break;
            case TICKET_STATUS:
                isValid = validateTicketStatusEvent(dto, context);
                break;
            case TICKET_PRIORITY:
                isValid = validateTicketPriorityEvent(dto, context);
                break;
            case SLA_DAYS_REMINDER:
                isValid = validateSLADaysReminderEvent(dto, context);
                break;
            case SLA_BREACH:
                isValid = validateSLABreachEvent(dto, context);
                break;
            case TICKET_DATE_EXTENSION:
                isValid = validateTicketDateExtensionEvent(dto, context);
                break;
            default:
                LOG.warn("Unrecognized event: {}", dto.getEvent());
                break;
        }
        return isValid;
    }


    private boolean validateCreateEvent(ClaimTicketWorkFlowDTO dto, ConstraintValidatorContext context) {
        boolean isValid = true;
        // Validate createConditions
        if (dto.getCreateConditions() == null || dto.getCreateConditions().isEmpty()) {
            isValid = addValidationMessage("createConditions", NOT_EMPTY, context) && isValid;
        }
        // Validate createActions
        if (dto.getCreateActions() == null || dto.getCreateActions().isEmpty()) {
            isValid = addValidationMessage(CREATE_ACTIONS, NOT_EMPTY, context) && isValid;
        } else {
            boolean assignToTeamPresent = false;
            boolean assignToAgentPresent = false;

            for (int i = 0; i < dto.getCreateActions().size(); i++) {
                CreateAction action = dto.getCreateActions().get(i);
                String actionPath = String.format(ACTION_FORMAT, CREATE_ACTIONS, i);
                if (action.getAction() == null) {
                    isValid = addValidationMessage(actionPath + ACTION, NOT_NULL, context) && isValid;
                    continue;
                }
                TemplateMaster templateMaster;
                User user;
                Team team;
                switch (action.getAction()) {
                    case ASSIGN_TO_TEAM:
                        assignToTeamPresent = true;
                        //TEAM
                        if (action.getTeamId() == null) {
                            isValid = addValidationMessage(actionPath + TEAM_ID, NOT_NULL, context) && isValid;
                        } else {
                            team = teamService.findActiveTeam(action.getTeamId());
                            if (team == null) {
                                isValid = addValidationMessage(actionPath + TEAM_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        //AGENT
                        if (action.getAgentId() == null) {
                            isValid = addValidationMessage(actionPath + AGENT_ID, NOT_NULL, context) && isValid;
                        } else {
                            if (dto.getInstanceType().equals(InstanceTypeEnum.FIRST_INSTANCE) && dto.getOrganizationId() != null) {
                                user = userService.findActiveFIUser(action.getAgentId(), dto.getOrganizationId());
                            } else {
                                user = userService.findActiveSEPSUser(action.getAgentId());
                            }
                            if (user == null) {
                                isValid = addValidationMessage(actionPath + AGENT_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        break;
                    case ASSIGN_TO_AGENT:
                        assignToAgentPresent = true;
                        if (action.getAgentId() == null) {
                            isValid = addValidationMessage(actionPath + AGENT_ID, NOT_NULL, context) && isValid;
                        } else {
                            if (dto.getInstanceType().equals(InstanceTypeEnum.FIRST_INSTANCE) && dto.getOrganizationId() != null) {
                                user = userService.findActiveFIUser(action.getAgentId(), dto.getOrganizationId());
                            } else {
                                user = userService.findActiveSEPSUser(action.getAgentId());
                            }
                            if (user == null) {
                                isValid = addValidationMessage(actionPath + AGENT_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        break;
                    case MAIL_TO_FI_TEAM, MAIL_TO_SEPS_TEAM:
                        if (action.getTeamId() == null) {
                            isValid = addValidationMessage(actionPath + TEAM_ID, NOT_NULL, context) && isValid;
                        } else {
                            team = teamService.findActiveTeam(action.getTeamId());
                            if (team == null) {
                                isValid = addValidationMessage(actionPath + TEAM_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        if (action.getAgentId() == null) {
                            isValid = addValidationMessage(actionPath + AGENT_ID, NOT_NULL, context) && isValid;
                        } else {
                            user = userService.findActiveSEPSOrFIUser(action.getAgentId());
                            if (user == null) {
                                isValid = addValidationMessage(actionPath + AGENT_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        if (action.getTemplateId() == null) {
                            isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_NULL, context) && isValid;
                        } else {
                            templateMaster = templateMasterService.findActiveTemplate(action.getTemplateId());
                            if (templateMaster == null) {
                                isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        break;
                    case MAIL_TO_FI_AGENT, MAIL_TO_SEPS_AGENT, MAIL_TO_CUSTOMER:
                        if (action.getTemplateId() == null) {
                            isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_NULL, context) && isValid;
                        } else {
                            templateMaster = templateMasterService.findActiveTemplate(action.getTemplateId());
                            if (templateMaster == null) {
                                isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        break;
                    default:
                        LOG.warn("Unrecognized action: {}", action.getAction());
                        break;
                }
            }

            if (!assignToTeamPresent && !assignToAgentPresent) {
                isValid = addValidationMessage(CREATE_ACTIONS, "assign.to.team.or.agent.required", context) && isValid;
            }

            if (assignToTeamPresent && assignToAgentPresent) {
                isValid = addValidationMessage(CREATE_ACTIONS, "assign.to.team.and.agent.not.allowed", context) && isValid;
            }
        }

        return isValid;
    }

    private boolean validateTicketStatusEvent(ClaimTicketWorkFlowDTO dto, ConstraintValidatorContext context) {
        boolean isValid = true;
        // Validate ticketStatusConditions
        if (dto.getTicketStatusConditions() == null || dto.getTicketStatusConditions().isEmpty()) {
            isValid = addValidationMessage("ticketStatusConditions", NOT_EMPTY, context) && isValid;
        } else {
            // Validate each TicketStatusCondition
            for (int i = 0; i < dto.getTicketStatusConditions().size(); i++) {
                TicketStatusCondition condition = dto.getTicketStatusConditions().get(i);
                String conditionPath = String.format(ACTION_FORMAT, "ticketStatusConditions", i);
                // Check if status is CLOSED, then closedStatus is required
                if (condition.getStatus() == ClaimTicketStatusEnum.CLOSED && condition.getClosedStatus() == null) {
                    isValid = addValidationMessage(conditionPath + ".closedStatus", NOT_NULL, context) && isValid;
                }
                // Check if status is REJECTED, then rejectedStatus is required
                if (condition.getStatus() == ClaimTicketStatusEnum.REJECTED && condition.getRejectedStatus() == null) {
                    isValid = addValidationMessage(conditionPath + ".rejectedStatus", NOT_NULL, context) && isValid;
                }
            }
        }
        // Validate ticketStatusActions
        if (dto.getTicketStatusActions() == null || dto.getTicketStatusActions().isEmpty()) {
            isValid = addValidationMessage(TICKET_STATUS_ACTIONS, NOT_EMPTY, context) && isValid;
        } else {
            for (int i = 0; i < dto.getTicketStatusActions().size(); i++) {
                TicketStatusAction action = dto.getTicketStatusActions().get(i);
                String actionPath = String.format(ACTION_FORMAT, TICKET_STATUS_ACTIONS, i);
                if (action.getAction() == null) {
                    isValid = addValidationMessage(actionPath + ACTION, NOT_NULL, context) && isValid;
                    continue;
                }

                TemplateMaster templateMaster;
                User user;
                Team team;
                switch (action.getAction()) {
                    case MAIL_TO_FI_TEAM, MAIL_TO_SEPS_TEAM:
                        if (action.getTeamId() == null) {
                            isValid = addValidationMessage(actionPath + TEAM_ID, NOT_NULL, context) && isValid;
                        } else {
                            team = teamService.findActiveTeam(action.getTeamId());
                            if (team == null) {
                                isValid = addValidationMessage(actionPath + TEAM_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        if (action.getAgentId() == null) {
                            isValid = addValidationMessage(actionPath + AGENT_ID, NOT_NULL, context) && isValid;
                        } else {
                            user = userService.findActiveSEPSOrFIUser(action.getAgentId());
                            if (user == null) {
                                isValid = addValidationMessage(actionPath + AGENT_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        if (action.getTemplateId() == null) {
                            isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_NULL, context) && isValid;
                        } else {
                            templateMaster = templateMasterService.findActiveTemplate(action.getTemplateId());
                            if (templateMaster == null) {
                                isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        break;
                    case MAIL_TO_FI_AGENT, MAIL_TO_SEPS_AGENT, MAIL_TO_CUSTOMER:
                        if (action.getTemplateId() == null) {
                            isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_NULL, context) && isValid;
                        } else {
                            templateMaster = templateMasterService.findActiveTemplate(action.getTemplateId());
                            if (templateMaster == null) {
                                isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        break;
                    default:
                        LOG.warn("Unrecognized action ticket status: {}", action.getAction());
                        break;
                }
            }
        }
        return isValid;
    }

    private boolean validateTicketPriorityEvent(ClaimTicketWorkFlowDTO dto, ConstraintValidatorContext context) {
        boolean isValid = true;
        // Validate ticketPriorityConditions
        if (dto.getTicketPriorityConditions() == null || dto.getTicketPriorityConditions().isEmpty()) {
            isValid = addValidationMessage("ticketPriorityConditions", NOT_EMPTY, context) && isValid;
        }
        // Validate ticketPriorityActions
        if (dto.getTicketPriorityActions() == null || dto.getTicketPriorityActions().isEmpty()) {
            isValid = addValidationMessage(TICKET_PRIORITY_ACTIONS, NOT_EMPTY, context) && isValid;
        } else {
            for (int i = 0; i < dto.getTicketPriorityActions().size(); i++) {
                TicketPriorityAction action = dto.getTicketPriorityActions().get(i);
                String actionPath = String.format(ACTION_FORMAT, TICKET_PRIORITY_ACTIONS, i);

                if (action.getAction() == null) {
                    isValid = addValidationMessage(actionPath + ACTION, NOT_NULL, context) && isValid;
                    continue;
                }

                TemplateMaster templateMaster;
                User user;
                Team team;

                switch (action.getAction()) {
                    case MAIL_TO_FI_TEAM, MAIL_TO_SEPS_TEAM:
                        if (action.getTeamId() == null) {
                            isValid = addValidationMessage(actionPath + TEAM_ID, NOT_NULL, context) && isValid;
                        } else {
                            team = teamService.findActiveTeam(action.getTeamId());
                            if (team == null) {
                                isValid = addValidationMessage(actionPath + TEAM_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        if (action.getAgentId() == null) {
                            isValid = addValidationMessage(actionPath + AGENT_ID, NOT_NULL, context) && isValid;
                        } else {
                            user = userService.findActiveSEPSOrFIUser(action.getAgentId());
                            if (user == null) {
                                isValid = addValidationMessage(actionPath + AGENT_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        if (action.getTemplateId() == null) {
                            isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_NULL, context) && isValid;
                        } else {
                            templateMaster = templateMasterService.findActiveTemplate(action.getTemplateId());
                            if (templateMaster == null) {
                                isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        break;
                    case MAIL_TO_FI_AGENT, MAIL_TO_SEPS_AGENT, MAIL_TO_CUSTOMER:
                        if (action.getTemplateId() == null) {
                            isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_NULL, context) && isValid;
                        } else {
                            templateMaster = templateMasterService.findActiveTemplate(action.getTemplateId());
                            if (templateMaster == null) {
                                isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        break;
                    default:
                        LOG.warn("Unrecognized action ticket priority: {}", action.getAction());
                        break;
                }
            }
        }
        return isValid;
    }

    private boolean validateSLADaysReminderEvent(ClaimTicketWorkFlowDTO dto, ConstraintValidatorContext context) {
        boolean isValid = true;
        // Validate slaDaysReminderConditions
        if (dto.getSlaDaysReminderConditions() == null || dto.getSlaDaysReminderConditions().isEmpty()) {
            isValid = addValidationMessage("slaDaysReminderConditions", NOT_EMPTY, context) && isValid;
        }
        // Validate ticketPriorityActions
        if (dto.getSlaDaysReminderActions() == null || dto.getSlaDaysReminderActions().isEmpty()) {
            isValid = addValidationMessage(SLA_DAYS_REMINDER_ACTIONS, NOT_EMPTY, context) && isValid;
        } else {
            for (int i = 0; i < dto.getSlaDaysReminderActions().size(); i++) {
                SLADaysReminderAction action = dto.getSlaDaysReminderActions().get(i);
                String actionPath = String.format(ACTION_FORMAT, SLA_DAYS_REMINDER_ACTIONS, i);
                if (action.getAction() == null) {
                    isValid = addValidationMessage(actionPath + ACTION, NOT_NULL, context) && isValid;
                    continue;
                }

                TemplateMaster templateMaster;
                User user;
                Team team;

                switch (action.getAction()) {
                    case MAIL_TO_FI_TEAM, MAIL_TO_SEPS_TEAM:
                        if (action.getTeamId() == null) {
                            isValid = addValidationMessage(actionPath + TEAM_ID, NOT_NULL, context) && isValid;
                        } else {
                            team = teamService.findActiveTeam(action.getTeamId());
                            if (team == null) {
                                isValid = addValidationMessage(actionPath + TEAM_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        if (action.getAgentId() == null) {
                            isValid = addValidationMessage(actionPath + AGENT_ID, NOT_NULL, context) && isValid;
                        } else {
                            user = userService.findActiveSEPSOrFIUser(action.getAgentId());
                            if (user == null) {
                                isValid = addValidationMessage(actionPath + AGENT_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        if (action.getTemplateId() == null) {
                            isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_NULL, context) && isValid;
                        } else {
                            templateMaster = templateMasterService.findActiveTemplate(action.getTemplateId());
                            if (templateMaster == null) {
                                isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        break;
                    case MAIL_TO_FI_AGENT, MAIL_TO_SEPS_AGENT, MAIL_TO_CUSTOMER:
                        if (action.getTemplateId() == null) {
                            isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_NULL, context) && isValid;
                        } else {
                            templateMaster = templateMasterService.findActiveTemplate(action.getTemplateId());
                            if (templateMaster == null) {
                                isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        break;
                    default:
                        LOG.warn("Unrecognized action sla days reminder: {}", action.getAction());
                        break;
                }
            }
        }
        return isValid;
    }

    private boolean validateSLABreachEvent(ClaimTicketWorkFlowDTO dto, ConstraintValidatorContext context) {
        boolean isValid = true;
        // Validate slaBreachActions
        if (dto.getSlaBreachActions() == null || dto.getSlaBreachActions().isEmpty()) {
            isValid = addValidationMessage(SLA_BREACH_ACTIONS, NOT_EMPTY, context) && isValid;
        } else {
            for (int i = 0; i < dto.getSlaBreachActions().size(); i++) {
                SLABreachAction action = dto.getSlaBreachActions().get(i);
                String actionPath = String.format(ACTION_FORMAT, SLA_BREACH_ACTIONS, i);
                if (action.getAction() == null) {
                    isValid = addValidationMessage(actionPath + ACTION, NOT_NULL, context) && isValid;
                    continue;
                }

                TemplateMaster templateMaster;
                User user;
                Team team;

                switch (action.getAction()) {
                    case MAIL_TO_FI_TEAM, MAIL_TO_SEPS_TEAM:
                        if (action.getTeamId() == null) {
                            isValid = addValidationMessage(actionPath + TEAM_ID, NOT_NULL, context) && isValid;
                        } else {
                            team = teamService.findActiveTeam(action.getTeamId());
                            if (team == null) {
                                isValid = addValidationMessage(actionPath + TEAM_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        if (action.getAgentId() == null) {
                            isValid = addValidationMessage(actionPath + AGENT_ID, NOT_NULL, context) && isValid;
                        } else {
                            user = userService.findActiveSEPSOrFIUser(action.getAgentId());
                            if (user == null) {
                                isValid = addValidationMessage(actionPath + AGENT_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        if (action.getTemplateId() == null) {
                            isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_NULL, context) && isValid;
                        } else {
                            templateMaster = templateMasterService.findActiveTemplate(action.getTemplateId());
                            if (templateMaster == null) {
                                isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_FOUND, context) && isValid;
                            }
                        }

                        break;
                    case MAIL_TO_FI_AGENT, MAIL_TO_SEPS_AGENT, MAIL_TO_CUSTOMER:
                        if (action.getTemplateId() == null) {
                            isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_NULL, context) && isValid;
                        } else {
                            templateMaster = templateMasterService.findActiveTemplate(action.getTemplateId());
                            if (templateMaster == null) {
                                isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        break;
                    default:
                        LOG.warn("Unrecognized action sla breach event: {}", action.getAction());
                        break;
                }
            }
        }
        return isValid;
    }

    private boolean validateTicketDateExtensionEvent(ClaimTicketWorkFlowDTO dto, ConstraintValidatorContext context) {
        boolean isValid = true;
        // Validate slaBreachActions
        if (dto.getTicketDateExtensionActions() == null || dto.getTicketDateExtensionActions().isEmpty()) {
            isValid = addValidationMessage(TICKET_DATE_EXTENSION_ACTIONS, NOT_EMPTY, context) && isValid;
        } else {
            for (int i = 0; i < dto.getTicketDateExtensionActions().size(); i++) {
                TicketDateExtensionAction action = dto.getTicketDateExtensionActions().get(i);
                String actionPath = String.format(ACTION_FORMAT, TICKET_DATE_EXTENSION_ACTIONS, i);
                if (action.getAction() == null) {
                    isValid = addValidationMessage(actionPath + ACTION, NOT_NULL, context) && isValid;
                    continue;
                }

                TemplateMaster templateMaster;
                User user;
                Team team;

                switch (action.getAction()) {
                    case MAIL_TO_FI_TEAM, MAIL_TO_SEPS_TEAM:
                        if (action.getTeamId() == null) {
                            isValid = addValidationMessage(actionPath + TEAM_ID, NOT_NULL, context) && isValid;
                        } else {
                            team = teamService.findActiveTeam(action.getTeamId());
                            if (team == null) {
                                isValid = addValidationMessage(actionPath + TEAM_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        if (action.getAgentId() == null) {
                            isValid = addValidationMessage(actionPath + AGENT_ID, NOT_NULL, context) && isValid;
                        } else {
                            user = userService.findActiveSEPSOrFIUser(action.getAgentId());
                            if (user == null) {
                                isValid = addValidationMessage(actionPath + AGENT_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        if (action.getTemplateId() == null) {
                            isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_NULL, context) && isValid;
                        } else {
                            templateMaster = templateMasterService.findActiveTemplate(action.getTemplateId());
                            if (templateMaster == null) {
                                isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        break;
                    case MAIL_TO_FI_AGENT, MAIL_TO_SEPS_AGENT, MAIL_TO_CUSTOMER:
                        if (action.getTemplateId() == null) {
                            isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_NULL, context) && isValid;
                        } else {
                            templateMaster = templateMasterService.findActiveTemplate(action.getTemplateId());
                            if (templateMaster == null) {
                                isValid = addValidationMessage(actionPath + TEMPLATE_ID, NOT_FOUND, context) && isValid;
                            }
                        }
                        break;
                    default:
                        LOG.warn("Unrecognized action validate ticket date extension event: {}", action.getAction());
                        break;
                }
            }
        }
        return isValid;
    }


    private boolean addValidationMessage(String fieldName, String message, ConstraintValidatorContext context) {
        String errorMessage = messageSource.getMessage(message, null, LocaleContextHolder.getLocale());
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(errorMessage)
            .addPropertyNode(fieldName)
            .addConstraintViolation();
        return false;
    }
}
