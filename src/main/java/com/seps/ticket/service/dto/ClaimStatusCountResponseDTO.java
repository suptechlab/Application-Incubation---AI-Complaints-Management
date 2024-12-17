package com.seps.ticket.service.dto;

import com.seps.ticket.enums.ClaimTicketStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ClaimStatusCountResponseDTO {
    private Long totalClaims;
    private Map<ClaimTicketStatusEnum, Long> countsByStatus;
}
