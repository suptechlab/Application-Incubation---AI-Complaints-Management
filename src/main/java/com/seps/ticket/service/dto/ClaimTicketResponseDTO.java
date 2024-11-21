package com.seps.ticket.service.dto;

import lombok.Data;

@Data
public class ClaimTicketResponseDTO {
    private Boolean checkDuplicate;
    private Boolean foundDuplicate;
    private Long duplicateTicketId;
    private Long newTicketId;
    private String email;
}
