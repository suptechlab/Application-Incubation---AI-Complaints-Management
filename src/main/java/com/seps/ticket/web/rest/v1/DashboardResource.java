package com.seps.ticket.web.rest.v1;

import com.seps.ticket.service.DashboardService;
import com.seps.ticket.service.dto.DashboardDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard", description = "Operations related to Dashboard APIs.")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SEPS_USER','ROLE_FI_USER')")
public class DashboardResource {

    private final DashboardService dashboardService;
    public DashboardResource(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Operation(
        summary = "Get Dashboard Graph and Tiles",
        description = "Fetches the data required for dashboard graphs and tiles, filtered by organization ID and date range."
    )
    @GetMapping("/graph-and-tiles")
    public ResponseEntity<DashboardDTO> getMasterData(
        @Parameter(description = "Organization ID for filtering.", required = false)
        @RequestParam(required = false) Long organizationId,
        @Parameter(description = "Start date for filtering in the format 'yyyy-MM-dd'.", required = false)
        @RequestParam(required = false) String startDate,
        @Parameter(description = "End date for filtering in the format 'yyyy-MM-dd'.", required = false)
        @RequestParam(required = false) String endDate) {
        DashboardDTO dashboardData = dashboardService.getGraphAndTiles(organizationId, startDate, endDate);
        return ResponseEntity.ok(dashboardData);
    }

}
