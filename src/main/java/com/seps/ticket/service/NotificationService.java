package com.seps.ticket.service;

import com.seps.ticket.config.Constants;
import com.seps.ticket.domain.*;
import com.seps.ticket.enums.InstanceTypeEnum;
import com.seps.ticket.repository.ClaimTicketRepository;
import com.seps.ticket.repository.NotificationRepository;
import com.seps.ticket.repository.TemplateMasterRepository;
import com.seps.ticket.repository.UserNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final ClaimTicketRepository claimTicketRepository;
    private final TemplateVariableMappingService templateVariableMappingService;

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

    @Transactional
    public void sendCustomerReplyToAgentNotification(Long ticketId) {
        ClaimTicket ticket = claimTicketRepository.findById(ticketId)
                .orElse(null);
        if(ticket == null) {
            return;
        }
        User agent = null;
        if(ticket.getInstanceType().equals(InstanceTypeEnum.FIRST_INSTANCE) && ticket.getFiAgentId() != null) {
            agent = userService.getUserById(ticket.getFiAgentId());
        }else if(ticket.getSepsAgentId() != null){
            agent = userService.getUserById(ticket.getSepsAgentId());
        }
        if(agent!=null) {
            Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(ticket, agent);
            this.sendNotification("CUSTOMER_REPLY_AGENT_NOTIFICATION", variables.get(Constants.ADMIN_TICKET_URL_TEXT), List.of(agent.getId()), variables);
        }
    }
}
