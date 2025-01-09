package com.seps.user.service.dto;

import lombok.Data;

import java.util.List;

@Data
public class RasaResponseDTO {
    private String recipientId;
    private String text;
    private String image;
    private String link;
    private String event;
    private String id_token;
    private Boolean file_upload_required = false;
    private List<ButtonDTO> buttons;

    // Getters and Setters

    @Data
    public static class ButtonDTO {
        private String title;
        private String payload;

        // Getters and Setters
    }
}
