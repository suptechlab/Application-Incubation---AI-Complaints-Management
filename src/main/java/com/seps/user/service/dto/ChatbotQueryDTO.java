package com.seps.user.service.dto;

import lombok.Data;

@Data
public class ChatbotQueryDTO {

    private String query;
    private Long userId;
    private String sessionId;

    // Getters and Setters
}

