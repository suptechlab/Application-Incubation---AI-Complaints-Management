package com.seps.admin.service.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;

@Data
public class UserNotificationDTO {
    private Long id;
    private NotificationDto notification;
    private Boolean isRead;
    private Instant readAt;

    @Data
    public static class NotificationDto implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;
        private Long id;
        private String title;
        private String message;
        private String type;
        private String redirectUrl;
        private Instant createdAt;
    }


}
