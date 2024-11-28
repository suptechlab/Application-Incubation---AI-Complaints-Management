package com.seps.ticket.web.rest.v1;

import com.seps.ticket.enums.ClaimTicketPriorityEnum;
import com.seps.ticket.enums.ClaimTicketStatusEnum;
import com.seps.ticket.service.SepsAndFiClaimTicketService;
import com.seps.ticket.service.dto.AssignTicketRequestDTO;
import com.seps.ticket.service.dto.ClaimTicketDTO;
import com.seps.ticket.service.dto.DropdownListDTO;
import com.seps.ticket.service.dto.RequestInfo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;

import java.util.List;

@Tag(name = "SEPS and FI Claim Ticket Management", description = "APIs for SEPS and FI to manage their Claim Tickets")
@RestController
@RequestMapping("/api/v1/seps-fi/claim-tickets")
public class SepsAndFiClaimTicketResource {

    private final SepsAndFiClaimTicketService sepsAndFiClaimTicketService;

    public SepsAndFiClaimTicketResource(SepsAndFiClaimTicketService sepsAndFiClaimTicketService) {
        this.sepsAndFiClaimTicketService =  sepsAndFiClaimTicketService;
    }

    @Operation(summary = "List all Claim Ticket", description = "Retrieve a paginated list of all claim tickets")
    @ApiResponse(responseCode = "200", description = "Claim Ticket List retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ClaimTicketDTO.class)))
    @GetMapping
    public ResponseEntity<List<ClaimTicketDTO>> listSepsFiClaimTickets(Pageable pageable,
                                                                           @RequestParam(required = false) String search,
                                                                           @RequestParam(required = false) ClaimTicketStatusEnum claimTicketStatus,
                                                                           @RequestParam(required = false) ClaimTicketPriorityEnum claimTicketPriority,
                                                                           @RequestParam(required = false) String startDate,
                                                                           @RequestParam(required = false) String endDate,
                                                                           @RequestParam(required = false) Long organizationId,
                                                                           @RequestParam(required = false) Long claimTypeId) {
        Page<ClaimTicketDTO> page = sepsAndFiClaimTicketService.listSepsAndFiClaimTickets(pageable, search, claimTicketStatus, claimTicketPriority, startDate, endDate, organizationId, claimTypeId);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @Operation(summary = "Get a Claim by ID", description = "Retrieve a claim by its ID")
    @ApiResponse(responseCode = "200", description = "Claim retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ClaimTicketDTO.class)))
    @GetMapping("/{id}")
    public ResponseEntity<ClaimTicketDTO> getSepsFiClaimTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(sepsAndFiClaimTicketService.getSepsFiClaimTicketById(id));
    }

    @GetMapping("/agents-list")
    public ResponseEntity<List<DropdownListDTO>> getAgentList() {
        return ResponseEntity.ok(sepsAndFiClaimTicketService.getAgentList());
    }


    @PostMapping("/{agentId}/assign-tickets-fi-agent")
    public ResponseEntity<Void> assignTicketToFiAgent(
        @PathVariable Long agentId,
        @RequestBody @Valid AssignTicketRequestDTO assignTicketRequestDTO,
        HttpServletRequest request
    ) {
        RequestInfo requestInfo = new RequestInfo(request);
        sepsAndFiClaimTicketService.assignTicketsToFiAgent(agentId, assignTicketRequestDTO);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{agentId}/assign-tickets-seps-agent")
    public ResponseEntity<Void> assignTicketToSepsAgent(
        @PathVariable Long agentId,
        @RequestBody @Valid AssignTicketRequestDTO assignTicketRequestDTO,
        HttpServletRequest request
    ) {
        RequestInfo requestInfo = new RequestInfo(request);
        sepsAndFiClaimTicketService.assignTicketsToSepsAgent(agentId, assignTicketRequestDTO);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{ticketId}/priority")
    public ResponseEntity<Void> updateClaimTicketPriority(
        @PathVariable Long ticketId,
        @RequestParam("priority") ClaimTicketPriorityEnum priority,
        HttpServletRequest request
    ) {
        RequestInfo requestInfo = new RequestInfo(request);
        sepsAndFiClaimTicketService.updatePriority(ticketId, priority);
        return ResponseEntity.ok().build();
    }

}
