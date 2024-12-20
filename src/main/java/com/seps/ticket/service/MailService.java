package com.seps.ticket.service;

import com.seps.ticket.component.EnumUtil;
import com.seps.ticket.domain.ClaimTicket;
import com.seps.ticket.domain.TemplateMaster;
import com.seps.ticket.domain.User;
import com.seps.ticket.enums.ClaimTicketPriorityEnum;
import com.seps.ticket.repository.TemplateMasterRepository;
import com.seps.ticket.service.dto.ClaimTicketDTO;
import com.seps.ticket.service.dto.FIUserDTO;
import com.seps.ticket.service.dto.MailDTO;
import com.seps.ticket.service.dto.UserClaimTicketDTO;
import com.seps.ticket.service.dto.workflow.ClaimTicketWorkFlowDTO;
import com.seps.ticket.service.dto.workflow.CreateAction;
import com.seps.ticket.suptech.service.ExternalAPIService;
import com.seps.ticket.web.rest.vm.ClaimTicketClosedRequest;
import com.seps.ticket.web.rest.vm.ClaimTicketRejectRequest;
import com.seps.ticket.web.rest.vm.ClaimTicketReplyRequest;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Lazy;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import tech.jhipster.config.JHipsterProperties;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for sending emails asynchronously.
 * <p>
 * We use the {@link Async} annotation to send emails asynchronously.
 */
@Service
public class MailService {

    private static final Logger LOG = LoggerFactory.getLogger(MailService.class);

    private static final String USER = "user";

    private static final String BASE_URL = "baseUrl";

    private static final String BASE_URL_USER = "baseUrlUser";

    private static final String USERNAME = "username";

    private static final String URL = "url";

    private static final String TICKET_NUMBER = "ticketNumber";

    private static final String STATUS = "status";

    private static final String PREVIOUS_INSTANCE = "previousInstance";

    private static final String PREVIOUS_STATUS = "previousStatus";

    private static final String NEW_INSTANCE = "newInstance";

    private static final String NEW_STATUS = "newStatus";

    private static final String INSTANCE_COMMENT = "instanceComment";

    private static final String SENDER_NAME = "senderName";

    private final JHipsterProperties jHipsterProperties;

    private final JavaMailSender javaMailSender;

    private final MessageSource messageSource;

    private final SpringTemplateEngine templateEngine;

    private final TemplateMasterRepository templateMasterRepository;

    private final EnumUtil enumUtil;

    private final ExternalAPIService externalAPIService;

    private final TemplateVariableMappingService templateVariableMappingService;

    @Value("${website.user-base-url:test}")
    private String userBaseUrl;

    private final UserClaimTicketService userClaimTicketService;

    private final ClaimTicketWorkFlowService claimTicketWorkFlowService;

    private final TemplateMasterService templateMasterService;

    private final UserService userService;

    public MailService(
        JHipsterProperties jHipsterProperties,
        JavaMailSender javaMailSender,
        MessageSource messageSource,
        SpringTemplateEngine templateEngine,
        TemplateMasterRepository templateMasterRepository,
        EnumUtil enumUtil,
        ExternalAPIService externalAPIService,
        TemplateVariableMappingService templateVariableMappingService, @Lazy UserClaimTicketService userClaimTicketService,
        ClaimTicketWorkFlowService claimTicketWorkFlowService, TemplateMasterService templateMasterService, UserService userService) {
        this.jHipsterProperties = jHipsterProperties;
        this.javaMailSender = javaMailSender;
        this.messageSource = messageSource;
        this.templateEngine = templateEngine;
        this.templateMasterRepository = templateMasterRepository;
        this.enumUtil = enumUtil;
        this.externalAPIService = externalAPIService;
        this.templateVariableMappingService = templateVariableMappingService;
        this.userClaimTicketService = userClaimTicketService;
        this.claimTicketWorkFlowService = claimTicketWorkFlowService;
        this.templateMasterService = templateMasterService;
        this.userService = userService;
    }

    @Async
    public void sendEmail(String to, String subject, String content, boolean isMultipart, boolean isHtml) {
        this.sendEmailSync(to, subject, content, isMultipart, isHtml);
    }

    private void sendEmailSync(String to, String subject, String content, boolean isMultipart, boolean isHtml) {
        LOG.debug(
            "Send email[multipart '{}' and html '{}'] to '{}' with subject '{}' and content={}",
            isMultipart,
            isHtml,
            to,
            subject,
            content
        );

        // Prepare message using a Spring helper
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper message = new MimeMessageHelper(mimeMessage, isMultipart, StandardCharsets.UTF_8.name());
            message.setTo(to);
            message.setFrom(jHipsterProperties.getMail().getFrom());
            message.setSubject(subject);
            message.setText(content, isHtml);
            javaMailSender.send(mimeMessage);
            LOG.debug("Sent email to User '{}'", to);
        } catch (MailException | MessagingException e) {
            LOG.warn("Email could not be sent to user '{}'", to, e);
        }
    }


    private void sendEmailFromTemplateSync(User user, String templateName, String titleKey) {
        if (user.getEmail() == null) {
            LOG.debug("Email doesn't exist for user '{}'", user.getLogin());
            return;
        }
        Locale locale = Locale.forLanguageTag(user.getLangKey());
        Context context = new Context(locale);
        context.setVariable(USER, user);
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        String content = templateEngine.process(templateName, context);
        String subject = messageSource.getMessage(titleKey, null, locale);
        this.sendEmailSync(user.getEmail(), subject, content, false, true);
    }

    @Async
    public void sendEmailFromTemplate(User user, String templateName, String titleKey) {
        this.sendEmailFromTemplateSync(user, templateName, titleKey);
    }

    @Async
    public void sendActivationEmail(User user) {
        LOG.debug("Sending activation email to '{}'", user.getEmail());
        this.sendEmailFromTemplateSync(user, "mail/activationEmail", "email.activation.title");
    }


    @Async
    public void sendClaimTicketCreationEmail(UserClaimTicketDTO claimTicket) {
        if (StringUtils.isBlank(claimTicket.getUser().getEmail())) {
            LOG.error("User email is missing or invalid. Cannot send claim ticket creation email.");
            return;
        }
        LOG.debug("Preparing claim ticket creation email for user '{}'", claimTicket.getUser().getName());
        try {

            MailDTO mailDTO = new MailDTO();
            mailDTO.setLocale(claimTicket.getUser().getLangKey());
            mailDTO.setTo(claimTicket.getUser().getEmail());
            mailDTO.setTemplateKey("CLAIM_TICKET_CREATED");
            Map<String, String> dataVariables = new HashMap<>();
            dataVariables.put(USERNAME, claimTicket.getUser().getName());
            dataVariables.put(TICKET_NUMBER, claimTicket.getTicketId().toString());
            dataVariables.put("claimType", claimTicket.getClaimType().getName());
            dataVariables.put("claimSubType", claimTicket.getClaimSubType().getName());
            dataVariables.put("priority", enumUtil.getLocalizedEnumValue(claimTicket.getPriority(), Locale.forLanguageTag(claimTicket.getUser().getLangKey())));
            dataVariables.put(STATUS, enumUtil.getLocalizedEnumValue(claimTicket.getStatus(), Locale.forLanguageTag(claimTicket.getUser().getLangKey())));
            dataVariables.put("razonSocial", claimTicket.getOrganization().getRazonSocial());
            dataVariables.put("ruc", claimTicket.getOrganization().getRuc());
            dataVariables.put(URL, userBaseUrl + "/my-account/" + claimTicket.getTicketId().toString());
            mailDTO.setDataVariables(dataVariables);
            this.sendDynamicContentEmail(mailDTO);

            LOG.info("Claim ticket creation email sent successfully to {}", claimTicket.getUser().getEmail());
        } catch (Exception e) {
            LOG.error("Failed to send claim ticket creation email to {}: {}", claimTicket.getUser().getEmail(), e.getMessage());
        }
    }

    public void sendDynamicContentEmail(MailDTO mailDTO) {
        TemplateMaster template = mailDTO.getIsStatic() ? templateMasterRepository.findByTemplateKeyIgnoreCaseAndStatus(mailDTO.getTemplateKey(), true)
            .orElse(null) : templateMasterRepository.findByIdAndStatus(mailDTO.getTemplateId(), true)
            .orElse(null);

        if (template != null) {
            // Extract supported variables from the template
            Set<String> supportedVariables = parseSupportedVariables(template.getSupportedVariables());

            // Prepare dynamic content
            String subject = replacePlaceholders(template.getSubject(), mailDTO.getDataVariables(), supportedVariables);
            String content = replacePlaceholders(template.getContent(), mailDTO.getDataVariables(), supportedVariables);

            // Render HTML template with Thymeleaf
            String renderedContent = renderEmailTemplate(subject, content, Locale.forLanguageTag(mailDTO.getLocale()));

            // Send email
            Boolean isSent = externalAPIService.sendEmailViaApi(mailDTO, subject, renderedContent);
            if (Boolean.FALSE.equals(isSent)) {
                LOG.debug("External API Not working trying to test email service now...");
                this.sendEmailSync(mailDTO.getTo(), subject, renderedContent, false, true);
            }
        } else {
            LOG.debug("Template with key '{}' not found or inactive. Using default content.", mailDTO.getTemplateKey());
        }
    }

    private String replacePlaceholders(String template, Map<String, String> variables, Set<String> supportedVariables) {
        if (template == null || variables == null) return template;

        // Filter variables to include only supported ones
        variables.keySet().retainAll(supportedVariables);

        for (Map.Entry<String, String> entry : variables.entrySet()) {
            template = template.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return template;
    }

    private Set<String> parseSupportedVariables(String supportedVariables) {
        if (supportedVariables == null || supportedVariables.isEmpty()) return Collections.emptySet();

        // supportedVariables is stored as a comma-separated string in the DB
        return Arrays.stream(supportedVariables.split(","))
            .map(variable -> variable.replace("{{", "").replace("}}", ""))
            .collect(Collectors.toSet());
    }

    private String renderEmailTemplate(String subject, String content, Locale locale) {
        if (locale == null) {
            locale = Locale.ENGLISH; // Default fallback locale
        }
        Context context = new Context(locale);
        context.setVariable("subject", subject);
        context.setVariable("content", content);
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        // Render the template
        return templateEngine.process("mail/commonEmailTemplate", context);
    }

    @Async
    public void sendClosedTicketEmail(ClaimTicket ticket, ClaimTicketClosedRequest claimTicketClosedRequest, User currentUser) {
        MailDTO mailDTO = new MailDTO();
        mailDTO.setTo(currentUser.getEmail());
        mailDTO.setLocale(currentUser.getLangKey());
        mailDTO.setTemplateKey("CLAIM_TICKET_CLOSED");
        Map<String, String> dataVariables = new HashMap<>();
        dataVariables.put(USERNAME, currentUser.getFirstName());
        dataVariables.put(TICKET_NUMBER, ticket.getTicketId().toString());
        dataVariables.put("reason", claimTicketClosedRequest.getReason());
        dataVariables.put(STATUS, enumUtil.getLocalizedEnumValue(claimTicketClosedRequest.getCloseSubStatus(), Locale.forLanguageTag(currentUser.getLangKey())));
        mailDTO.setDataVariables(dataVariables);
        this.sendDynamicContentEmail(mailDTO);

        LOG.info("Claim ticket closed email sent successfully to {}", currentUser.getEmail());
    }

    @Async
    public void sendPriorityChangeEmail(ClaimTicket ticket, ClaimTicketPriorityEnum newPriority, User currentUser, String updatedBy) {
        MailDTO mailDTO = new MailDTO();
        mailDTO.setTo(currentUser.getEmail());
        mailDTO.setLocale(currentUser.getLangKey());
        mailDTO.setTemplateKey("CLAIM_TICKET_PRIORITY_CHANGE_AGENT");
        Map<String, String> dataVariables = new HashMap<>();
        dataVariables.put(USERNAME, currentUser.getFirstName());
        dataVariables.put(TICKET_NUMBER, ticket.getTicketId().toString());
        dataVariables.put("ticketPriority", enumUtil.getLocalizedEnumValue(newPriority, Locale.forLanguageTag(currentUser.getLangKey())));
        dataVariables.put("updatedBy", updatedBy);
        dataVariables.put(STATUS, enumUtil.getLocalizedEnumValue(ticket.getStatus(), Locale.forLanguageTag(currentUser.getLangKey())));
        mailDTO.setDataVariables(dataVariables);
        this.sendDynamicContentEmail(mailDTO);
    }

    @Async
    public void sendToAgentTicketAssignmentEmail(ClaimTicket ticket, User currentUser) {
        MailDTO mailDTO = new MailDTO();
        mailDTO.setTo(currentUser.getEmail());
        mailDTO.setLocale(currentUser.getLangKey());
        mailDTO.setTemplateKey("ASSIGN_TICKET_NOTIFY_AGENT");
        Map<String, String> dataVariables = new HashMap<>();
        dataVariables.put(USERNAME, currentUser.getFirstName());
        dataVariables.put(TICKET_NUMBER, ticket.getTicketId().toString());
        dataVariables.put("customerName", ticket.getUser().getFirstName());
        dataVariables.put("customerEmail", ticket.getUser().getEmail());
        dataVariables.put("assignedDate", ticket.getAssignedAt().toString());
        mailDTO.setDataVariables(dataVariables);
        this.sendDynamicContentEmail(mailDTO);
    }

    @Async
    public void sendToCustomerTicketAssignmentEmail(ClaimTicket ticket, User currentUser, String agentName) {
        MailDTO mailDTO = new MailDTO();
        mailDTO.setTo(currentUser.getEmail());
        mailDTO.setLocale(currentUser.getLangKey());
        mailDTO.setTemplateKey("ASSIGN_TICKET_NOTIFY_CUSTOMER");
        Map<String, String> dataVariables = new HashMap<>();
        dataVariables.put(USERNAME, currentUser.getFirstName());
        dataVariables.put(TICKET_NUMBER, ticket.getTicketId().toString());
        dataVariables.put("agentName", agentName);
        dataVariables.put("assignedDate", ticket.getAssignedAt().toString());
        mailDTO.setDataVariables(dataVariables);
        this.sendDynamicContentEmail(mailDTO);
    }

    @Async
    public void sendRejectedTicketEmail(ClaimTicket ticket, ClaimTicketRejectRequest claimTicketRejectRequest, User currentUser) {
        MailDTO mailDTO = new MailDTO();
        mailDTO.setTo(currentUser.getEmail());
        mailDTO.setLocale(currentUser.getLangKey());
        mailDTO.setTemplateKey("CLAIM_TICKET_REJECTED_NOTIFY_AGENT");
        Map<String, String> dataVariables = new HashMap<>();
        dataVariables.put(USERNAME, currentUser.getFirstName());
        dataVariables.put(TICKET_NUMBER, ticket.getTicketId().toString());
        dataVariables.put("reason", claimTicketRejectRequest.getReason());
        dataVariables.put("rejectedStatus", enumUtil.getLocalizedEnumValue(claimTicketRejectRequest.getRejectedStatus(), Locale.forLanguageTag(currentUser.getLangKey())));
        mailDTO.setDataVariables(dataVariables);
        this.sendDynamicContentEmail(mailDTO);

        LOG.info("Rejected ticket closed email sent successfully to agent {}", currentUser.getEmail());
    }

    @Async
    public void sendRejectedTicketEmailToCustomer(ClaimTicket ticket, ClaimTicketRejectRequest claimTicketRejectRequest, User currentUser) {
        MailDTO mailDTO = new MailDTO();
        mailDTO.setTo(currentUser.getEmail());
        mailDTO.setLocale(currentUser.getLangKey());
        mailDTO.setTemplateKey("CLAIM_TICKET_REJECTED_NOTIFY_CUSTOMER");
        Map<String, String> dataVariables = new HashMap<>();
        dataVariables.put(USERNAME, currentUser.getFirstName());
        dataVariables.put(TICKET_NUMBER, ticket.getTicketId().toString());
        dataVariables.put("reason", claimTicketRejectRequest.getReason());
        dataVariables.put("rejectedStatus", enumUtil.getLocalizedEnumValue(claimTicketRejectRequest.getRejectedStatus(), Locale.forLanguageTag(currentUser.getLangKey())));
        mailDTO.setDataVariables(dataVariables);
        this.sendDynamicContentEmail(mailDTO);

        LOG.info("Rejected ticket closed email sent successfully to customer {}", currentUser.getEmail());
    }

    @Async
    public void sendSecondInstanceClaimEmail(UserClaimTicketDTO prevUserClaimTicketDTO, UserClaimTicketDTO userClaimTicketDTO) {
        if (StringUtils.isBlank(userClaimTicketDTO.getUser().getEmail())) {
            LOG.error("User email is missing or invalid. Cannot send claim ticket instance email.");
            return;
        }
        LOG.debug("Preparing claim ticket instance creation email for user '{}'", userClaimTicketDTO.getUser().getName());
        try {
            MailDTO mailDTO = new MailDTO();
            mailDTO.setLocale(userClaimTicketDTO.getUser().getLangKey());
            mailDTO.setTo(userClaimTicketDTO.getUser().getEmail());
            mailDTO.setTemplateKey("CLAIM_TICKET_INSTANCE");
            Map<String, String> dataVariables = new HashMap<>();
            dataVariables.put(USERNAME, userClaimTicketDTO.getUser().getName());
            dataVariables.put(TICKET_NUMBER, userClaimTicketDTO.getTicketId().toString());
            dataVariables.put(PREVIOUS_INSTANCE, enumUtil.getLocalizedEnumValue(prevUserClaimTicketDTO.getInstanceType(), Locale.forLanguageTag(userClaimTicketDTO.getUser().getLangKey())));
            dataVariables.put(PREVIOUS_STATUS, enumUtil.getLocalizedEnumValue(prevUserClaimTicketDTO.getStatus(), Locale.forLanguageTag(userClaimTicketDTO.getUser().getLangKey())));
            dataVariables.put(NEW_INSTANCE, enumUtil.getLocalizedEnumValue(userClaimTicketDTO.getInstanceType(), Locale.forLanguageTag(userClaimTicketDTO.getUser().getLangKey())));
            dataVariables.put(NEW_STATUS, enumUtil.getLocalizedEnumValue(userClaimTicketDTO.getStatus(), Locale.forLanguageTag(userClaimTicketDTO.getUser().getLangKey())));
            dataVariables.put(INSTANCE_COMMENT, userClaimTicketDTO.getSecondInstanceComment());
            dataVariables.put(URL, userBaseUrl + "/my-account/" + userClaimTicketDTO.getTicketId().toString());
            mailDTO.setDataVariables(dataVariables);
            this.sendDynamicContentEmail(mailDTO);
            LOG.info("Claim ticket instance email sent successfully to {}", userClaimTicketDTO.getUser().getEmail());
        } catch (Exception e) {
            LOG.error("Failed to send claim ticket instance email to {}: {}", userClaimTicketDTO.getUser().getEmail(), e.getMessage());
        }
    }

    @Async
    public void sendCustomerReplyEmail(Map<String, String> ticketDetail, ClaimTicketReplyRequest claimTicketRejectRequest, User agentUser) {
        MailDTO mailDTO = new MailDTO();
        String attachments = messageSource.getMessage("claim.ticket.attachment.no", null, Locale.forLanguageTag(agentUser.getLangKey()));
        if (!CollectionUtils.isEmpty(claimTicketRejectRequest.getAttachments())) {
            attachments = messageSource.getMessage("claim.ticket.attachment.yes", null, Locale.forLanguageTag(agentUser.getLangKey()));
        }
        mailDTO.setTo(agentUser.getEmail());
        mailDTO.setLocale(agentUser.getLangKey());
        mailDTO.setTemplateKey("CUSTOMER_REPLY_ON_TICKET_CONVERSATION");
        Map<String, String> dataVariables = new HashMap<>();
        dataVariables.put(USERNAME, agentUser.getFirstName());
        dataVariables.put(TICKET_NUMBER, ticketDetail.get(TICKET_NUMBER));
        dataVariables.put("customerName", ticketDetail.get("customerName"));
        dataVariables.put("messageContent", claimTicketRejectRequest.getMessage());
        dataVariables.put("attachmentDetails", attachments);
        mailDTO.setDataVariables(dataVariables);
        this.sendDynamicContentEmail(mailDTO);

        LOG.info("Customer reply on ticket and email sent successfully to agent or admin {}", agentUser.getEmail());
    }

    @Async
    public void sendReplyToCustomerEmail(Map<String, String> ticketDetail, ClaimTicketReplyRequest claimTicketRejectRequest, User currentUser) {
        MailDTO mailDTO = new MailDTO();
        mailDTO.setTo(currentUser.getEmail());
        mailDTO.setLocale(currentUser.getLangKey());
        mailDTO.setTemplateKey("REPLY_TO_CUSTOMER_ON_TICKET_CONVERSATION");
        Map<String, String> dataVariables = new HashMap<>();
        dataVariables.put(USERNAME, currentUser.getFirstName());
        dataVariables.put(TICKET_NUMBER, ticketDetail.get(TICKET_NUMBER));
        dataVariables.put(SENDER_NAME, ticketDetail.get(SENDER_NAME));
        dataVariables.put("messageContent", claimTicketRejectRequest.getMessage());
        dataVariables.put("ticketUrl", userBaseUrl + "/my-account/");
        mailDTO.setDataVariables(dataVariables);
        this.sendDynamicContentEmail(mailDTO);

        LOG.info("Reply to Customer on ticket and email sent successfully to customer {}", currentUser.getEmail());
    }

    @Async
    public void sendReplyToInternalEmail(Map<String, String> ticketDetail, ClaimTicketReplyRequest claimTicketRejectRequest, User currentUser) {
        MailDTO mailDTO = new MailDTO();
        mailDTO.setTo(currentUser.getEmail());
        mailDTO.setLocale(currentUser.getLangKey());
        mailDTO.setTemplateKey("REPLY_TO_INTERNAL_ON_TICKET_CONVERSATION");
        Map<String, String> dataVariables = new HashMap<>();
        dataVariables.put(USERNAME, currentUser.getFirstName());
        dataVariables.put(TICKET_NUMBER, ticketDetail.get(TICKET_NUMBER));
        dataVariables.put(SENDER_NAME, ticketDetail.get(SENDER_NAME));
        dataVariables.put("customerName", ticketDetail.get("customerName"));
        dataVariables.put(STATUS, ticketDetail.get(STATUS));
        dataVariables.put("messageContent", claimTicketRejectRequest.getMessage());
        dataVariables.put("ticketUrl", jHipsterProperties.getMail().getBaseUrl() + "/ticket/view/" + ticketDetail.get("id"));
        mailDTO.setDataVariables(dataVariables);
        this.sendDynamicContentEmail(mailDTO);

        LOG.info("Reply to team on ticket and email sent successfully to team {}", currentUser.getEmail());
    }

    public void sendComplaintEmail(UserClaimTicketDTO userClaimTicketDTO) {

    }

    @Async
    public void handleWorkflowFileClaimTicket(Long claimTicketId, Long workflowId) {
        ClaimTicketDTO claimTicketDTO = userClaimTicketService.findClaimTicketById(claimTicketId);
        if (claimTicketDTO == null) {
            return;
        }
        ClaimTicketWorkFlowDTO claimTicketWorkFlowDTO = claimTicketWorkFlowService.findClaimTicketWorkFlowById(workflowId);
        if (claimTicketWorkFlowDTO == null) {
            return;
        }
        for (CreateAction createAction : claimTicketWorkFlowDTO.getCreateActions()) {
            Long agentId = createAction.getAgentId();
            Long templateId = createAction.getTemplateId();
            TemplateMaster templateMaster = null;
            if (templateId != null) {
                templateMaster = templateMasterService.findTemplateById(templateId);
            }
            User user = null;
            switch (createAction.getAction()) {
                case MAIL_TO_CUSTOMER:
                    if (templateId == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.template.id.null",
                            new Object[]{createAction.getAction()}, null, null);
                        continue;
                    }
                    if (templateMaster == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.template.not.found",
                            new Object[]{templateId}, null, templateId);
                        continue;
                    }
                    if (claimTicketDTO.getUserId() == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.customer.id.null",
                            new Object[]{createAction.getAction()}, null, null);
                        continue;
                    }
                    user = userService.findUserById(claimTicketDTO.getUserId());
                    if (user == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.customer.not.found",
                            new Object[]{claimTicketDTO.getUserId()}, claimTicketDTO.getUserId(), null);
                        continue;
                    }
                    break;
                case MAIL_TO_FI_TEAM:
                    if (templateId == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.template.id.null",
                            new Object[]{createAction.getAction()}, null, null);
                        continue;
                    }
                    if (templateMaster == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.template.not.found",
                            new Object[]{templateId}, null, templateId);
                        continue;
                    }
                    if (agentId == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.agent.id.null",
                            new Object[]{createAction.getAction()}, null, null);
                        continue;
                    }
                    user = claimTicketWorkFlowService.findFIUserForMailAction(agentId, claimTicketWorkFlowDTO);
                    if (user == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.user.not.found",
                            new Object[]{agentId}, agentId, null);
                        continue;
                    }
                    break;
                case MAIL_TO_FI_AGENT:
                    if (templateId == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.template.id.null",
                            new Object[]{createAction.getAction()}, null, null);
                        continue;
                    }
                    if (templateMaster == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.template.not.found",
                            new Object[]{templateId}, null, templateId);
                        continue;
                    }
                    if (claimTicketDTO.getFiAgent() == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.agent.id.null",
                            new Object[]{createAction.getAction()}, null, null);
                        continue;
                    }
                    user = userService.findUserById(claimTicketDTO.getFiAgent().getId());
                    if (user == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.user.not.found",
                            new Object[]{claimTicketDTO.getFiAgent().getId()}, claimTicketDTO.getFiAgent().getId(), null);
                        continue;
                    }
                    break;
                case MAIL_TO_SEPS_TEAM:
                    if (templateId == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.template.id.null",
                            new Object[]{createAction.getAction()}, null, null);
                        continue;
                    }
                    if (templateMaster == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.template.not.found", new Object[]{templateId}, null, templateId);
                        continue;
                    }
                    if (agentId == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.agent.id.null", new Object[]{createAction.getAction()}, null, null);
                        continue;
                    }
                    user = claimTicketWorkFlowService.findSEPSUserForMailAction(agentId, claimTicketWorkFlowDTO);
                    if (user == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.user.not.found", new Object[]{agentId}, agentId, null);
                        continue;
                    }
                    break;
                case MAIL_TO_SEPS_AGENT:
                    if (templateId == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.template.id.null",
                            new Object[]{createAction.getAction()}, null, null);
                        continue;
                    }
                    if (templateMaster == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.template.not.found", new Object[]{templateId}, null, templateId);
                        continue;
                    }
                    if (claimTicketDTO.getSepsAgentId() == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.agent.id.null",
                            new Object[]{createAction.getAction()}, null, null);
                        continue;
                    }
                    user = userService.findUserById(claimTicketDTO.getSepsAgentId());
                    if (user == null) {
                        claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.user.not.found", new Object[]{claimTicketDTO.getSepsAgentId()}, claimTicketDTO.getSepsAgentId(), null);
                        continue;
                    }
                    break;
                // Add other cases if needed
                default:
                    // Handle unsupported actions or log them
                    break;
            }
            if (user != null && templateMaster != null) {
                MailDTO mailDTO = new MailDTO();
                mailDTO.setTemplateId(templateId);
                mailDTO.setTo(user.getEmail());
                mailDTO.setLocale(user.getLangKey());
                mailDTO.setIsStatic(false);
                mailDTO.setDataVariables(templateVariableMappingService.mapVariables(claimTicketDTO, user));
                sendDynamicContentEmail(mailDTO);
            }
        }
    }
}
