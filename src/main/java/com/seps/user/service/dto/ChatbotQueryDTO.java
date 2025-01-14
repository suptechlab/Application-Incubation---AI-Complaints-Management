package com.seps.user.service.dto;

import lombok.Data;

import java.util.Map;

@Data
public class ChatbotQueryDTO {

    private String message;
    private String sender;
    private Map<String, Object> metadata;
}

