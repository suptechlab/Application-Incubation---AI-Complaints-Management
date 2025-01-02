package com.seps.ticket.service.dto;

import com.seps.ticket.enums.ClosedStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class CloseClaimStatusCountResponseDTO {
    private Long totalClaims;
    private List<CloseClaimSubStatusDTO> countsByStatus;

    @Data
    public static class CloseClaimSubStatusDTO implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;
        private ClosedStatusEnum closedStatus;
        private String title;
        private Long count;

    }

}
