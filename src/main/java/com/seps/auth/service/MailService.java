package com.seps.auth.service;

import com.seps.auth.domain.Otp;
import com.seps.auth.domain.TemplateMaster;
import com.seps.auth.domain.User;
import com.seps.auth.repository.TemplateMasterRepository;
import com.seps.auth.service.dto.MailDTO;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import tech.jhipster.config.JHipsterProperties;

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

    private static final String BASE_URL_USER = "baseUrlUser";

    private final TemplateMasterRepository templateMasterRepository;

    @Value("${website.user-base-url:test}")
    private String userBaseUrl;

    public MailService(
        JHipsterProperties jHipsterProperties,
        JavaMailSender javaMailSender,
        MessageSource messageSource,
        SpringTemplateEngine templateEngine,
        TemplateMasterRepository templateMasterRepository
    ) {
        this.jHipsterProperties = jHipsterProperties;
        this.javaMailSender = javaMailSender;
        this.messageSource = messageSource;
        this.templateEngine = templateEngine;
        this.templateMasterRepository = templateMasterRepository;
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
        context.setVariable(BASE_URL_USER, " https://user-suptechdev.seps.gob.ec");
        String content = templateEngine.process(templateName, context);
        String subject = messageSource.getMessage(titleKey, null, locale);
        this.sendEmailSync(user.getEmail(), subject, content, false, true);
    }

    @Async
    public void sendActivationEmail(User user) {
        LOG.debug("Sending activation email to '{}'", user.getEmail());
        //this.sendEmailFromTemplateSync(user, "mail/activationEmail", "email.activation.title");
        MailDTO mailDTO = new MailDTO();
        mailDTO.setLocale(user.getLangKey());
        mailDTO.setTo(user.getEmail());
        mailDTO.setTemplateKey("ACCOUNT_ACTIVATION");
        Map<String, String> dataVariables = new HashMap<>();
        dataVariables.put(USERNAME, user.getFirstName());
        dataVariables.put(URL, jHipsterProperties.getMail().getBaseUrl() + "/account/activate?key=" + user.getActivationKey());
        mailDTO.setDataVariables(dataVariables);
        this.sendDynamicContentEmail(mailDTO);
    }

    @Async
    public void sendCreationEmail(User user) {
        LOG.debug("Sending creation email to '{}'", user.getEmail());
        //this.sendEmailFromTemplateSync(user, "mail/creationEmail", "email.activation.title");
        MailDTO mailDTO = new MailDTO();
        mailDTO.setLocale(user.getLangKey());
        mailDTO.setTo(user.getEmail());
        mailDTO.setTemplateKey("ACCOUNT_ACTIVATION");
        Map<String, String> dataVariables = new HashMap<>();
        dataVariables.put(USERNAME, user.getFirstName());
        dataVariables.put(URL, jHipsterProperties.getMail().getBaseUrl() + "/account/reset/finish?key=" + user.getResetKey());
        mailDTO.setDataVariables(dataVariables);
        this.sendDynamicContentEmail(mailDTO);
    }

    @Async
    public void sendPasswordResetMail(User user) {
        LOG.debug("Sending password reset email to '{}'", user.getEmail());
        MailDTO mailDTO = new MailDTO();
        mailDTO.setLocale(user.getLangKey());
        mailDTO.setTo(user.getEmail());
        mailDTO.setTemplateKey("FORGOT_PASSWORD");
        Map<String, String> dataVariables = new HashMap<>();
        dataVariables.put(USERNAME, user.getFirstName());
        dataVariables.put(URL, jHipsterProperties.getMail().getBaseUrl() + "/reset-password?key=" + user.getResetKey());
        mailDTO.setDataVariables(dataVariables);
        this.sendDynamicContentEmail(mailDTO);
    }

    @Async
    public void sendLoginOtpEmail(User user) {
        if (user.getEmail() == null) {
            LOG.debug("Email doesn't exist for user while sending otp email to '{}'", user.getLogin());
            return;
        }
        LOG.debug("Sending login otp email to '{}'", user.getEmail());
        Instant now = Instant.now();
        long secondsLeft = Duration.between(now, user.getOtpCodeExpirationTime()).getSeconds();
        long minutesLeft = (long) Math.ceil(secondsLeft / 60.0); // Round up to the nearest minute

        MailDTO mailDTO = new MailDTO();
        mailDTO.setLocale(user.getLangKey());
        mailDTO.setTo(user.getEmail());
        mailDTO.setTemplateKey("YOUR_OTP_CODE");
        Map<String, String> dataVariables = new HashMap<>();
        dataVariables.put(USERNAME, user.getFirstName());
        dataVariables.put("minutes", String.valueOf(minutesLeft));
        dataVariables.put("otpCode", String.valueOf(user.getOtpCode()));
        mailDTO.setDataVariables(dataVariables);
        this.sendDynamicContentEmail(mailDTO);

    }

    @Async
    public void sendRegisterOtpEmail(Otp otp, Locale locale) {
        if (otp.getEmail() == null) {
            LOG.debug("Email doesn't exist for user while sending register otp email to '{}'", otp.getEmail());
            return;
        }
        LOG.debug("Sending register otp email to '{}'", otp.getEmail());
        Instant now = Instant.now();
        long secondsLeft = Duration.between(now, otp.getExpiryTime()).getSeconds();
        long minutesLeft = (long) Math.ceil(secondsLeft / 60.0); // Round up to the nearest minute

        MailDTO mailDTO = new MailDTO();
        mailDTO.setLocale(locale.getLanguage());
        mailDTO.setTo(otp.getEmail());
        mailDTO.setTemplateKey("REGISTER_YOUR_OTP_CODE");
        Map<String, String> dataVariables = new HashMap<>();
        dataVariables.put("minutes", String.valueOf(minutesLeft));
        dataVariables.put("otpCode", String.valueOf(otp.getOtpCode()));
        mailDTO.setDataVariables(dataVariables);
        this.sendDynamicContentEmail(mailDTO);

    }

    @Async
    public void sendAccountSetupEmail(User user) {
        LOG.debug("Sending account setup email to '{}'", user.getEmail());
        this.sendEmailFromTemplateSync(user, "mail/accountSetupEmail", "email.account.setup.title");
    }

    //@Async
    public void sendDynamicContentEmail(MailDTO mailDTO) {
        TemplateMaster template = templateMasterRepository.findByTemplateKeyIgnoreCaseAndStatus(mailDTO.getTemplateKey(), true)
            .orElse(null);

        if(template != null) {
            // Prepare dynamic content
            String subject = replacePlaceholders(template.getSubject(), mailDTO.getDataVariables());
            String content = replacePlaceholders(template.getContent(), mailDTO.getDataVariables());

            // Render HTML template with Thymeleaf
            String renderedContent = renderEmailTemplate(subject, content, Locale.forLanguageTag(mailDTO.getLocale()));

            // Send email
            this.sendEmailSync(mailDTO.getTo(), subject, renderedContent, false, true);
        }else {
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
        Context context = new Context(locale);
        context.setVariable("subject", subject);
        context.setVariable("content", content);
        context.setVariable(BASE_URL, jHipsterProperties.getMail().getBaseUrl());
        // Render the template
        return templateEngine.process("mail/commonEmailTemplate", context);
    }
}
