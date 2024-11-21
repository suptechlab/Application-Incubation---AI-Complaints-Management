package com.seps.ticket.service.dto;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class TicketDTO {
    private Long id;
    private String title;
    private String description;
    private String createdBy;
    private String processedBy;
    // Getters and Setters
}
