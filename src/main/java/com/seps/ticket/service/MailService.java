package com.seps.ticket.service;

import com.seps.ticket.domain.User;
import com.seps.ticket.service.dto.UserClaimTicketDTO;
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
import java.util.Locale;

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

    private final JHipsterProperties jHipsterProperties;

    private final JavaMailSender javaMailSender;

    private final MessageSource messageSource;

    private final SpringTemplateEngine templateEngine;

    public MailService(
        JHipsterProperties jHipsterProperties,
        JavaMailSender javaMailSender,
        MessageSource messageSource,
        SpringTemplateEngine templateEngine
    ) {
        this.jHipsterProperties = jHipsterProperties;
        this.javaMailSender = javaMailSender;
        this.messageSource = messageSource;
        this.templateEngine = templateEngine;
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
            Locale locale = Locale.forLanguageTag(claimTicket.getUser().getLangKey());
            if (locale == null) {
                locale = Locale.ENGLISH; // Default fallback locale
            }
            Context context = new Context(locale);
            context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
            context.setVariable(BASE_URL_USER, " https://user-suptechdev.seps.gob.ec");
            context.setVariable("userName", claimTicket.getUser().getName());
            context.setVariable("ticketId", claimTicket.getTicketId().toString());
            context.setVariable("claimType", claimTicket.getClaimType().getName());
            context.setVariable("claimSubType", claimTicket.getClaimSubType().getName());
            context.setVariable("priority", claimTicket.getPriority());
            context.setVariable("status", claimTicket.getStatus());
            String content = templateEngine.process("mail/claimTicketCreationEmail", context);
            String subject = messageSource.getMessage("email.claim.creation.title", null, locale);
            this.sendEmailSync(claimTicket.getUser().getEmail(), subject, content, false, true);
            LOG.info("Claim ticket creation email sent successfully to {}", claimTicket.getUser().getEmail());
        } catch (Exception e) {
            LOG.error("Failed to send claim ticket creation email to {}: {}", claimTicket.getUser().getEmail(), e.getMessage());
        }
    }

}
