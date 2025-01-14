package com.seps.admin.service;

import com.seps.admin.domain.TemplateMaster;
import com.seps.admin.domain.User;
import com.seps.admin.repository.TemplateMasterRepository;
import com.seps.admin.service.dto.MailDTO;
import com.seps.admin.suptech.service.ExternalAPIService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import java.util.List;
import java.util.Locale;
import java.util.Map;
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

    private static final String USERNAME = "username";

    private static final String URL = "url";

    private final JHipsterProperties jHipsterProperties;

    private final JavaMailSender javaMailSender;

    private final MessageSource messageSource;

    private final SpringTemplateEngine templateEngine;

    private final UserService userService;

    private final TemplateMasterRepository templateMasterRepository;

    private final ExternalAPIService externalAPIService;

    public MailService(
        JHipsterProperties jHipsterProperties,
        JavaMailSender javaMailSender,
        MessageSource messageSource,
        SpringTemplateEngine templateEngine,
        UserService userService,
        TemplateMasterRepository templateMasterRepository,
        ExternalAPIService externalAPIService
    ) {
        this.jHipsterProperties = jHipsterProperties;
        this.javaMailSender = javaMailSender;
        this.messageSource = messageSource;
        this.templateEngine = templateEngine;
        this.userService = userService;
        this.templateMasterRepository = templateMasterRepository;
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

    @Async
    public void sendEmailFromTemplate(User user, String templateName, String titleKey) {
        this.sendEmailFromTemplateSync(user, templateName, titleKey);
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
    public void sendSepsUserCreationEmail(User user) {
        LOG.debug("Sending creation email to '{}'", user.getEmail());
        //this.sendEmailFromTemplateSync(user, "mail/sepsUserCreationEmail", "email.seps.user.creation.title");
        MailDTO mailDTO = new MailDTO();
        mailDTO.setLocale(user.getLangKey());
        mailDTO.setTo(user.getEmail());
        mailDTO.setTemplateKey("SEPS_USER_CREATION");
        Map<String, String> dataVariables = new HashMap<>();
        dataVariables.put(USERNAME, user.getFirstName());
        dataVariables.put(URL, jHipsterProperties.getMail().getBaseUrl());
        mailDTO.setDataVariables(dataVariables);
        this.sendDynamicContentEmail(mailDTO);
    }

    @Async
    public void sendFIUserCreationEmail(User user) {
        LOG.debug("Sending creation email to FI User '{}'", user.getEmail());
        //this.sendEmailFromTemplateSync(user, "mail/fiUserCreationEmail", "email.fi.user.creation.title");
        MailDTO mailDTO = new MailDTO();
        mailDTO.setLocale(user.getLangKey());
        mailDTO.setTo(user.getEmail());
        mailDTO.setTemplateKey("FI_USER_CREATION");
        Map<String, String> dataVariables = new HashMap<>();
        dataVariables.put(USERNAME, user.getFirstName());
        dataVariables.put("organizationName", user.getOrganization().getRazonSocial());
        dataVariables.put(URL, jHipsterProperties.getMail().getBaseUrl() + "/reset-password?key=" + user.getResetKey());
        mailDTO.setDataVariables(dataVariables);
        this.sendDynamicContentEmail(mailDTO);
    }

    // Send a welcome email to the new member
    @Async
    public void sendWelcomeToTeamEmail(User newUser, String teamName) {
        LOG.debug("Sending welcome email to new assigned User '{}'", newUser.getEmail());
        MailDTO mailDTO = new MailDTO();
        mailDTO.setLocale(newUser.getLangKey());
        mailDTO.setTo(newUser.getEmail());
        mailDTO.setTemplateKey("WELCOME_TO_TEAM_FOR_ASSIGNED_MEMBER");
        Map<String, String> dataVariables = new HashMap<>();
        dataVariables.put(USERNAME, newUser.getFirstName());
        dataVariables.put("teamName", teamName);
        mailDTO.setDataVariables(dataVariables);
        this.sendDynamicContentEmail(mailDTO);
    }

    // Notify existing members about the new member addition
    @Async
    public void sendNewMemberAddedNotification(User existingUser, String teamName, List<Long> newMemberIds) {
        LOG.debug("New Member Added to Team  '{}'", teamName);
        MailDTO mailDTO = new MailDTO();
        mailDTO.setLocale(existingUser.getLangKey());
        mailDTO.setTo(existingUser.getEmail());
        mailDTO.setTemplateKey("NEW_MEMBER_ADDED_TO_TEAM");
        Map<String, String> dataVariables = new HashMap<>();
        dataVariables.put(USERNAME, existingUser.getFirstName());
        dataVariables.put("teamName", teamName);
        dataVariables.put("membersName", getMemberNames(newMemberIds));
        mailDTO.setDataVariables(dataVariables);
        this.sendDynamicContentEmail(mailDTO);
    }

    private String getMemberNames(List<Long> memberIds) {
        // Fetch user details and concatenate their names
        return memberIds.stream()
            .map(memberId -> userService.getUserById(memberId).getFirstName())
            .collect(Collectors.joining(", "));
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
            if (Boolean.FALSE.equals(isSent)) {
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
            locale = Locale.forLanguageTag("es"); // Default fallback locale
        }
        Context context = new Context(locale);
        context.setVariable("subject", subject);
        context.setVariable("content", content);
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        // Render the template
        return templateEngine.process("mail/commonEmailTemplate", context);
    }
}
