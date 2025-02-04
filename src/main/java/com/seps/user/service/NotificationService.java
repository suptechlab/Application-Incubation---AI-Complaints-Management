package com.seps.user.service;

import com.seps.user.domain.Notification;
import com.seps.user.domain.TemplateMaster;
import com.seps.user.domain.User;
import com.seps.user.domain.UserNotification;
import com.seps.user.repository.NotificationRepository;
import com.seps.user.repository.TemplateMasterRepository;
import com.seps.user.repository.UserNotificationRepository;
import com.seps.user.service.dto.UserNotificationDTO;
import com.seps.user.service.mapper.UserNotificationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserNotificationRepository userNotificationRepository;
    private final TemplateMasterRepository templateMasterRepository;
    private final UserService userService;
    private final UserNotificationMapper userNotificationMapper;

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

    public Page<UserNotificationDTO> getUserNotifications(Pageable pageable) {
        User currenUser = userService.getCurrentUser();
        return userNotificationRepository.findAllByUserId(currenUser.getId(), pageable)
            .map(userNotificationMapper::toDTO);
    }

    public void markAsRead(Long notificationId) {
        UserNotification notification = userNotificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notification.setReadAt(Instant.now());
        userNotificationRepository.save(notification);
    }

    public void markAsReadAll() {
        User currentUser = userService.getCurrentUser();

        // Fetch all unread notifications for the current user
        List<UserNotification> unreadNotifications = userNotificationRepository.findByUserIdAndIsReadFalse(currentUser.getId());

        // Mark each notification as read
        unreadNotifications.forEach(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(Instant.now());
        });

        // Save all updated notifications
        userNotificationRepository.saveAll(unreadNotifications);
    }

    public void deleteNotificationById(Long notificationId) {
        userNotificationRepository.deleteById(notificationId);
    }

    @Transactional
    public void deleteAllNotifications() {
        User currentUser = userService.getCurrentUser(); // Get the logged-in user
        userNotificationRepository.deleteByUserId(currentUser.getId());
    }

    public Map<String, String> countAllNotifications() {
        User currentUser = userService.getCurrentUser(); // Get the logged-in user
        long unreadCount = userNotificationRepository.countByUserIdAndIsReadFalse(currentUser.getId());

        Map<String, String> response = new HashMap<>();
        response.put("unreadCount", String.valueOf(unreadCount));

        return response;
    }

}
