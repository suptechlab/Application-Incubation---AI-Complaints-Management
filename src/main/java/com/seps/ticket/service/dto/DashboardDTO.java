package com.seps.ticket.service.dto;

import lombok.Data;

@Data
public class DashboardDTO {
    private ClaimStatusCountResponseDTO claimStatusCount;
    private CloseClaimStatusCountResponseDTO closeClaimStatusCount;
    private PieChartDTO slaAdherenceGraph;
}
