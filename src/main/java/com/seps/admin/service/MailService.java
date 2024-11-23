package com.seps.admin.service;

import com.seps.admin.domain.Team;
import com.seps.admin.domain.User;
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
import java.util.List;
import java.util.Locale;
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

    private final JHipsterProperties jHipsterProperties;

    private final JavaMailSender javaMailSender;

    private final MessageSource messageSource;

    private final SpringTemplateEngine templateEngine;

    private final UserService userService;

    public MailService(
        JHipsterProperties jHipsterProperties,
        JavaMailSender javaMailSender,
        MessageSource messageSource,
        SpringTemplateEngine templateEngine,
        UserService userService
    ) {
        this.jHipsterProperties = jHipsterProperties;
        this.javaMailSender = javaMailSender;
        this.messageSource = messageSource;
        this.templateEngine = templateEngine;
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
        this.sendEmailFromTemplateSync(user, "mail/sepsUserCreationEmail", "email.seps.user.creation.title");
    }

    @Async
    public void sendFIUserCreationEmail(User user) {
        LOG.debug("Sending creation email to FI User '{}'", user.getEmail());
        this.sendEmailFromTemplateSync(user, "mail/fiUserCreationEmail", "email.fi.user.creation.title");
    }

    // Send a welcome email to the new member
    @Async
    public void sendWelcomeToTeamEmail(User newUser, String teamName) {
        LOG.debug("Sending welcome email to new assigned User '{}'", newUser.getEmail());
        String subject = "Welcome to Team " + teamName;
        String content = "Dear " + newUser.getFirstName() + ",\n\n"
            + "Welcome to the team \"" + teamName + "\"! We are excited to have you onboard.\n\n"
            + "Best regards,\nThe Team";

        this.sendEmailSync(newUser.getEmail(), subject, content, false, false);
    }

    // Notify existing members about the new member addition
    @Async
    public void sendNewMemberAddedNotification(User existingUser, String teamName, List<Long> newMemberIds) {
        String subject = "New Member Added to Team " + teamName;
        String content = "Dear " + existingUser.getFirstName() + ",\n\n"
            + "The following new member(s) have been added to your team \"" + teamName + "\":\n"
            + getMemberNames(newMemberIds) + "\n\n"
            + "Best regards,\nThe Team";

        this.sendEmailSync(existingUser.getEmail(), subject, content, false, false);
    }

    private String getMemberNames(List<Long> memberIds) {
        // Fetch user details and concatenate their names
        return memberIds.stream()
            .map(memberId -> userService.getUserById(memberId).getFirstName())
            .collect(Collectors.joining(", "));
    }
}
