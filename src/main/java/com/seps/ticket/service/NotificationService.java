package com.seps.ticket.service;

import com.seps.ticket.domain.Notification;
import com.seps.ticket.domain.TemplateMaster;
import com.seps.ticket.domain.User;
import com.seps.ticket.domain.UserNotification;
import com.seps.ticket.repository.NotificationRepository;
import com.seps.ticket.repository.TemplateMasterRepository;
import com.seps.ticket.repository.UserNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserNotificationRepository userNotificationRepository;
    private final TemplateMasterRepository templateMasterRepository;
    private final UserService userService;

    public void createNotification(String templateId, String title, String message, String redirectUrl, List<Long> userIds, Map<String, String> variables) {
        TemplateMaster template = null;

        String finalTitle = title != null ? title :  "Untitled";
        String finalMessage = message != null ? message : "No content available";

        if (templateId != null) {
            template = templateMasterRepository.findByTemplateKeyIgnoreCase(templateId).orElse(null);
            finalTitle = replaceVariables(template != null ? template.getSubject() : "", variables);
            finalMessage = replaceVariables(template != null ? template.getContent() : "", variables);
        }

        Notification notification = Notification.builder()
            .template(template)
            .title(finalTitle)
            .message(finalMessage)
            .type("INFO")
            .redirectUrl(redirectUrl)
            .createdAt(Instant.now())
            .build();

        notification = notificationRepository.save(notification);

        for (Long userId : userIds) {
            User user = userService.getUserById(userId);
            UserNotification userNotification = UserNotification.builder()
                .notification(notification)
                .user(user)
                .isRead(false)
                .build();
            userNotificationRepository.save(userNotification);
        }
    }

    public void sendNotification(String templateId, String redirectUrl, List<Long> userIds, Map<String, String> variables){
        this.createNotification(templateId,null,null, redirectUrl, userIds, variables);
    }

    public void sendNotification(String title, String message, String redirectUrl, List<Long> userIds, Map<String, String> variables){
        this.createNotification(null,title,message, redirectUrl, userIds, variables);
    }

    private String replaceVariables(String content, Map<String, String> variables) {
        if (content == null || variables == null || variables.isEmpty()) {
            return content;
        }

        for (Map.Entry<String, String> entry : variables.entrySet()) {
            content = content.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }

        return content;
    }
}
