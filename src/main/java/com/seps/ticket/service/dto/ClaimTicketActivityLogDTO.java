package com.seps.ticket.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimTicketActivityLogDTO {

    private Long id;
    private Long ticketId;
    private Long performedBy;
    private LocalDateTime performedAt;
    private String activityType;
    private String activityTitle;
    private Map<String, Object> activityDetails;
    private Map<String, String> linkedUsers;
    private Map<String, String> taggedUsers;
    private Map<String, String> attachmentUrl;
}
