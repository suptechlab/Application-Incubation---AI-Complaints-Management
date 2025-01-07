package com.seps.ticket.web.rest.v1;

import com.seps.ticket.aop.permission.PermissionCheck;
import com.seps.ticket.service.ReportService;
import com.seps.ticket.service.dto.ClaimTicketListDTO;
import com.seps.ticket.web.rest.vm.ClaimTicketFilterRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
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
@RequestMapping("/api/v1/report")
@Tag(name = "Reports", description = "Operations related to Report APIs.")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SEPS_USER','ROLE_FI_USER')")
public class ReportsResource {

    private final ReportService reportService;

    public ReportsResource(ReportService reportService) {
        this.reportService = reportService;
    }

    @Operation(
        summary = "Retrieve Claim Overview Report",
        description = "Fetch a paginated list of claim tickets based on various filters provided in the request. Requires the `CLAIM_OVERVIEW_REPORT` permission.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved claim overview report",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = ClaimTicketListDTO.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: User does not have permission"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    @GetMapping("/claim-overview")
    @PermissionCheck({"CLAIM_OVERVIEW_REPORT"})
    public ResponseEntity<List<ClaimTicketListDTO>> getClaimOverviewReport(Pageable pageable,
                                                                              @ModelAttribute ClaimTicketFilterRequest filterRequest) {
        Page<ClaimTicketListDTO> page = reportService.listClaimOverview(pageable, filterRequest);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @Operation(
        summary = "Download Claim Overview Report",
        description = "Generates and downloads the claim overview report in Excel format. Requires the `CLAIM_OVERVIEW_REPORT` permission.",
        responses = {
            @ApiResponse(responseCode = "200", description = "Successfully generated and downloaded the report",
                content = @Content(mediaType = "application/octet-stream")),
            @ApiResponse(responseCode = "403", description = "Forbidden: User does not have permission"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
        }
    )
    @GetMapping("/claim-overview/download")
    @PermissionCheck({"CLAIM_OVERVIEW_REPORT"})
    public ResponseEntity<byte[]> getDownloadClaimOverviewReport(@ModelAttribute ClaimTicketFilterRequest filterRequest) throws IOException {
        ByteArrayInputStream in = reportService.getDownloadClaimOverviewData(filterRequest);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=claim_overview_report.xlsx");
        try(in) {
            return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(in.readAllBytes());
        }
    }

}
