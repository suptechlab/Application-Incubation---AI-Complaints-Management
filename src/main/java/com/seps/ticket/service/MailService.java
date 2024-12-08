package com.seps.ticket.service;

import com.seps.ticket.component.EnumUtil;
import com.seps.ticket.domain.ClaimTicket;
import com.seps.ticket.domain.TemplateMaster;
import com.seps.ticket.domain.User;
import com.seps.ticket.enums.ClaimTicketPriorityEnum;
import com.seps.ticket.repository.TemplateMasterRepository;
import com.seps.ticket.service.dto.MailDTO;
import com.seps.ticket.service.dto.UserClaimTicketDTO;
import com.seps.ticket.suptech.service.ExternalAPIService;
import com.seps.ticket.web.rest.vm.ClaimTicketClosedRequest;
import com.seps.ticket.web.rest.vm.ClaimTicketRejectRequest;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import tech.jhipster.config.JHipsterProperties;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

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

    private final JHipsterProperties jHipsterProperties;

    private final JavaMailSender javaMailSender;

    private final MessageSource messageSource;

    private final SpringTemplateEngine templateEngine;

    private final TemplateMasterRepository templateMasterRepository;

    private final EnumUtil enumUtil;

    private final ExternalAPIService externalAPIService;

    @Value("${website.user-base-url:test}")
    private String userBaseUrl;

    public MailService(
        JHipsterProperties jHipsterProperties,
        JavaMailSender javaMailSender,
        MessageSource messageSource,
        SpringTemplateEngine templateEngine,
        TemplateMasterRepository templateMasterRepository,
        EnumUtil enumUtil,
        ExternalAPIService externalAPIService
    ) {
        this.jHipsterProperties = jHipsterProperties;
        this.javaMailSender = javaMailSender;
        this.messageSource = messageSource;
        this.templateEngine = templateEngine;
        this.templateMasterRepository = templateMasterRepository;
        this.enumUtil = enumUtil;
        this.externalAPIService = externalAPIService;
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
        TemplateMaster template = templateMasterRepository.findByTemplateKeyIgnoreCaseAndStatus(mailDTO.getTemplateKey(), true)
            .orElse(null);

        if (template != null) {
            // Prepare dynamic content
            String subject = replacePlaceholders(template.getSubject(), mailDTO.getDataVariables());
            String content = replacePlaceholders(template.getContent(), mailDTO.getDataVariables());

            // Render HTML template with Thymeleaf
            String renderedContent = renderEmailTemplate(subject, content, Locale.forLanguageTag(mailDTO.getLocale()));

            // Send email
            Boolean isSent = externalAPIService.sendEmailViaApi(mailDTO, subject, renderedContent);
            if(Boolean.FALSE.equals(isSent)) {
                LOG.debug("External API Not working trying to test email service now...");
                this.sendEmailSync(mailDTO.getTo(), subject, renderedContent, false, true);
            }
        } else {
            LOG.debug("Template with key '{}' not found or inactive. Using default content.", mailDTO.getTemplateKey());
        }
    }

    private String replacePlaceholders(String template, Map<String, String> variables) {
        if (template == null || variables == null) return template;

        for (Map.Entry<String, String> entry : variables.entrySet()) {
            template = template.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return template;
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
}
