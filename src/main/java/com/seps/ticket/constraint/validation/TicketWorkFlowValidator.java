package com.seps.ticket.constraint.validation;

import com.seps.ticket.enums.TicketWorkflowEventEnum;
import com.seps.ticket.service.dto.workflow.CreateAction;
import com.seps.ticket.service.dto.workflow.TicketWorkflowDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;

public class TicketWorkFlowValidator implements ConstraintValidator<TicketWorkFlowCondition, TicketWorkflowDTO> {

    private final MessageSource messageSource;

    private static final Logger LOG = LoggerFactory.getLogger(TicketWorkFlowValidator.class);

    // Constants for literals
    private static final String CREATE_ACTIONS = "createActions";
    private static final String NOT_NULL = "not.null";
    private static final String AGENT_ID = ".agentId";

    public TicketWorkFlowValidator(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    @Override
    public void initialize(TicketWorkFlowCondition constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(TicketWorkflowDTO dto, ConstraintValidatorContext context) {
        LOG.debug("dto:{}", dto);
        boolean isValid = true;

        if (dto.getEvent().equals(TicketWorkflowEventEnum.CREATED)) {
            // Validate createConditions
            if (dto.getCreateConditions() == null || dto.getCreateConditions().isEmpty()) {
                isValid = addValidationMessage("createConditions", "not.empty", context) && isValid;
            }
            // Validate createActions
            if (dto.getCreateActions() == null || dto.getCreateActions().isEmpty()) {
                isValid = addValidationMessage(CREATE_ACTIONS, "not.empty", context) && isValid;
            } else {
                boolean assignToTeamPresent = false;
                boolean assignToAgentPresent = false;

                for (int i = 0; i < dto.getCreateActions().size(); i++) {
                    CreateAction action = dto.getCreateActions().get(i);
                    String actionPath = String.format("%s[%d]", CREATE_ACTIONS, i);
                    // Check for null action
                    if (action.getAction() == null) {
                        isValid = addValidationMessage(actionPath + ".action", NOT_NULL, context) && isValid;
                        continue;  // Skip the validation logic if action is null
                    }

                    switch (action.getAction()) {
                        case ASSIGN_TO_TEAM:
                            assignToTeamPresent = true;
                            // Validation for teamId and agentId
                            if (action.getTeamId() == null) {
                                isValid = addValidationMessage(actionPath + ".teamId", NOT_NULL, context) && isValid;
                            }
                            if (action.getAgentId() == null) {
                                isValid = addValidationMessage(actionPath + AGENT_ID, NOT_NULL, context) && isValid;
                            }
                            break;
                        case ASSIGN_TO_AGENT:
                            assignToAgentPresent = true;
                            // Validation for agentId
                            if (action.getAgentId() == null) {
                                isValid = addValidationMessage(actionPath + AGENT_ID, NOT_NULL, context) && isValid;
                            }
                            break;
                        // Handle other cases for MAIL_TO_FI_TEAM, MAIL_TO_SEPS_TEAM, etc.
                        case MAIL_TO_FI_TEAM, MAIL_TO_SEPS_TEAM:
                            if (action.getTeamId() == null) {
                                isValid = addValidationMessage(actionPath + ".teamId", NOT_NULL, context) && isValid;
                            }
                            if (action.getAgentId() == null) {
                                isValid = addValidationMessage(actionPath + AGENT_ID, NOT_NULL, context) && isValid;
                            }
                            if (action.getTemplateId() == null) {
                                isValid = addValidationMessage(actionPath + ".templateId", NOT_NULL, context) && isValid;
                            }
                            break;

                        case MAIL_TO_FI_AGENT, MAIL_TO_SEPS_AGENT:
                            if (action.getAgentId() == null) {
                                isValid = addValidationMessage(actionPath + AGENT_ID, NOT_NULL, context) && isValid;
                            }
                            if (action.getTemplateId() == null) {
                                isValid = addValidationMessage(actionPath + ".templateId", NOT_NULL, context) && isValid;
                            }
                            break;

                        default:
                            LOG.warn("Unrecognized action: {}", action.getAction());
                            break;
                    }
                }
                // Additional validation to ensure that either ASSIGN_TO_TEAM or ASSIGN_TO_AGENT is present
                if (!assignToTeamPresent && !assignToAgentPresent) {
                    isValid = addValidationMessage(CREATE_ACTIONS, "assign.to.team.or.agent.required", context) && isValid;
                }

                // Additional validation to ensure that both ASSIGN_TO_TEAM and ASSIGN_TO_AGENT are not both present
                if (assignToTeamPresent && assignToAgentPresent) {
                    isValid = addValidationMessage(CREATE_ACTIONS, "assign.to.team.and.agent.not.allowed", context) && isValid;
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
