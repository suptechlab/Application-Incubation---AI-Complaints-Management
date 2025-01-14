package com.seps.ticket.web.rest.v1;

import com.seps.ticket.service.ClaimTicketService;
import com.seps.ticket.service.DashboardService;
import com.seps.ticket.service.SepsAndFiClaimTicketService;
import com.seps.ticket.service.dto.ClaimTicketListDTO;
import com.seps.ticket.service.dto.DashboardDTO;
import com.seps.ticket.web.rest.vm.ClaimTicketFilterRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard", description = "Operations related to Dashboard APIs.")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SEPS_USER','ROLE_FI_USER')")
public class DashboardResource {

    private final DashboardService dashboardService;
    private final SepsAndFiClaimTicketService sepsAndFiClaimTicketService;
    private final ClaimTicketService claimTicketService;

    public DashboardResource(DashboardService dashboardService, SepsAndFiClaimTicketService sepsAndFiClaimTicketService, ClaimTicketService claimTicketService) {
        this.dashboardService = dashboardService;
        this.sepsAndFiClaimTicketService = sepsAndFiClaimTicketService;
        this.claimTicketService = claimTicketService;
    }

    @Operation(
        summary = "Get Dashboard Graph and Tiles",
        description = "Fetches the data required for dashboard graphs and tiles, filtered by organization ID and date range."
    )
    @GetMapping("/graph-and-tiles")
    public ResponseEntity<DashboardDTO> getGraphsAndTilesData(
        @Parameter(description = "Organization ID for filtering.", required = false)
        @RequestParam(required = false) Long organizationId,
        @Parameter(description = "Start date for filtering in the format 'yyyy-MM-dd'.", required = false)
        @RequestParam(required = false) String startDate,
        @Parameter(description = "End date for filtering in the format 'yyyy-MM-dd'.", required = false)
        @RequestParam(required = false) String endDate) {
        DashboardDTO dashboardData = dashboardService.getGraphAndTiles(organizationId, startDate, endDate);
        return ResponseEntity.ok(dashboardData);
    }

    @GetMapping("/claim-and-complaints")
    public ResponseEntity<List<ClaimTicketListDTO>> getClaimAndComplaintsData(Pageable pageable,
                                                                              @ModelAttribute ClaimTicketFilterRequest filterRequest) {
        Page<ClaimTicketListDTO> page = sepsAndFiClaimTicketService.listSepsAndFiClaimTickets(pageable, filterRequest);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/claim-and-complaints/download")
    public ResponseEntity<byte[]> getDownloadClaimAndComplaintsData(@ModelAttribute ClaimTicketFilterRequest filterRequest) throws IOException {
        ByteArrayInputStream in = claimTicketService.getDownloadClaimAndComplaintsData(filterRequest);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=claim_and_complaints.xlsx");
        try(in) {
            return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(in.readAllBytes());
        }
    }

}
