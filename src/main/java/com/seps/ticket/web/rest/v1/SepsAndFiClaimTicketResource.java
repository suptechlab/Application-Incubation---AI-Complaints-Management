package com.seps.ticket.web.rest.v1;

import com.seps.ticket.domain.ClaimTicket;
import com.seps.ticket.enums.ClaimTicketPriorityEnum;
import com.seps.ticket.enums.ClaimTicketStatusEnum;
import com.seps.ticket.service.ClaimTicketActivityLogService;
import com.seps.ticket.service.SepsAndFiClaimTicketService;
import com.seps.ticket.service.dto.*;
import com.seps.ticket.service.dto.ResponseStatus;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import com.seps.ticket.web.rest.vm.ClaimTicketClosedRequest;
import com.seps.ticket.web.rest.vm.ClaimTicketRejectRequest;
import com.seps.ticket.web.rest.vm.ClaimTicketReplyRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.zalando.problem.Status;
import tech.jhipster.web.util.PaginationUtil;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

@Tag(name = "SEPS and FI Claim Ticket Management", description = "APIs for SEPS and FI to manage their Claim Tickets")
@RestController
@RequestMapping("/api/v1/seps-fi/claim-tickets")
public class SepsAndFiClaimTicketResource {

    private final SepsAndFiClaimTicketService sepsAndFiClaimTicketService;
    private final ClaimTicketActivityLogService claimTicketActivityLogService;
    private final MessageSource messageSource;

    public SepsAndFiClaimTicketResource(SepsAndFiClaimTicketService sepsAndFiClaimTicketService, ClaimTicketActivityLogService claimTicketActivityLogService,
                                        MessageSource messageSource) {
        this.sepsAndFiClaimTicketService =  sepsAndFiClaimTicketService;
        this.claimTicketActivityLogService = claimTicketActivityLogService;
        this.messageSource = messageSource;
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

    @Operation(summary = "Retrieve list of agents", description = "Get a list of agents available for ticket assignment")
    @ApiResponse(responseCode = "200", description = "Agent list retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = DropdownListDTO.class)))
    @GetMapping("/agents-list")
    public ResponseEntity<List<DropdownListDTO>> getAgentList() {
        return ResponseEntity.ok(sepsAndFiClaimTicketService.getAgentList());
    }


    @Operation(summary = "Assign tickets to FI Agent", description = "Assign a list of tickets to a specific FI agent")
    @ApiResponse(responseCode = "200", description = "Tickets assigned successfully")
    @PostMapping("/{agentId}/assign-tickets-fi-agent")
    public ResponseEntity<Void> assignTicketToFiAgent(
        @PathVariable Long agentId,
        @RequestBody @Valid AssignTicketRequestDTO assignTicketRequestDTO
    ) {
        List<ClaimTicket> ticketList = sepsAndFiClaimTicketService.assignTicketsToFiAgent(agentId, assignTicketRequestDTO);
        sepsAndFiClaimTicketService.sendAssignmentEmails(ticketList, agentId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Assign tickets to SEPS Agent", description = "Assign a list of tickets to a specific SEPS agent")
    @ApiResponse(responseCode = "200", description = "Tickets assigned successfully")
    @PostMapping("/{agentId}/assign-tickets-seps-agent")
    public ResponseEntity<Void> assignTicketToSepsAgent(
        @PathVariable Long agentId,
        @RequestBody @Valid AssignTicketRequestDTO assignTicketRequestDTO
    ) {
        List<ClaimTicket> ticketList = sepsAndFiClaimTicketService.assignTicketsToSepsAgent(agentId, assignTicketRequestDTO);
        sepsAndFiClaimTicketService.sendAssignmentEmails(ticketList, agentId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Update Claim Ticket Priority", description = "Update the priority of a specific claim ticket")
    @ApiResponse(responseCode = "200", description = "Claim ticket priority updated successfully")
    @PatchMapping("/{ticketId}/priority")
    public ResponseEntity<Void> updateClaimTicketPriority(
        @PathVariable Long ticketId,
        @RequestParam("priority") ClaimTicketPriorityEnum priority,
        HttpServletRequest request
    ) {
        RequestInfo requestInfo = new RequestInfo(request);
        sepsAndFiClaimTicketService.updatePriority(ticketId, priority, requestInfo);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get Activity Logs for a Claim Ticket", description = "Retrieve activity logs for a specific claim ticket")
    @ApiResponse(responseCode = "200", description = "Activity logs retrieved successfully")
    @GetMapping("/{ticketId}/activity-logs")
    public ResponseEntity<List<ClaimTicketActivityLogDTO>> claimTicketsActivityList(@PathVariable Long ticketId, Pageable pageable) {
        Page<ClaimTicketActivityLogDTO> page = claimTicketActivityLogService.getAllActivities(ticketId, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @Operation(summary = "Extend SLA for a Claim Ticket", description = "Extend the SLA (Service Level Agreement) for a specific claim ticket")
    @ApiResponse(responseCode = "200", description = "Claim ticket SLA extended successfully")
    @PostMapping("/{ticketId}/extend-sla")
    public ResponseEntity<ResponseStatus> extendClaimTicketSla(
        @PathVariable Long ticketId,
        @RequestParam("slaDate") String slaDate,
        @RequestParam(required = false) String reason,
        HttpServletRequest request) {
        try {
            LocalDate newSlaDate = LocalDate.parse(slaDate, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            RequestInfo requestInfo = new RequestInfo(request);
            sepsAndFiClaimTicketService.extendSlaDate(ticketId, newSlaDate, reason, requestInfo);
            ResponseStatus responseStatus = new ResponseStatus(
                messageSource.getMessage("claim.ticket.sla.extended.successfully", null, LocaleContextHolder.getLocale()),
                HttpStatus.OK.value(),
                System.currentTimeMillis());
            return ResponseEntity.ok(responseStatus);
        } catch (DateTimeParseException ex) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_DATE_FORMAT, null, null);
        }
    }

    @Operation(summary = "Get Claim Status Count", description = "Retrieve the count of claims grouped by status and the total count")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Counts retrieved successfully",
            content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = ClaimStatusCountResponseDTO.class))),
        @ApiResponse(responseCode = "403", description = "Access forbidden"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/count-by-status")
    public ResponseEntity<ClaimStatusCountResponseDTO> countClaimsByStatusAndTotal() {
        ClaimStatusCountResponseDTO count = sepsAndFiClaimTicketService.countClaimsByStatusAndTotal();
        return ResponseEntity.ok(count);
    }

    @Operation(
        summary = "Close a Claim Ticket",
        description = "Allows users to close a claim ticket by providing the necessary details and reason for closure.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Claim ticket closed successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ResponseStatus.class)
                )
            )
        }
    )
    @PostMapping("/{ticketId}/closed")
    public ResponseEntity<ResponseStatus> closeClaimTicket(
        @PathVariable Long ticketId, @Valid @RequestBody ClaimTicketClosedRequest claimTicketClosedRequest,
        HttpServletRequest request
    ) {
        RequestInfo requestInfo = new RequestInfo(request);
        // Delegate to service
        sepsAndFiClaimTicketService.closedClaimTicket(ticketId, claimTicketClosedRequest, requestInfo);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("claim.ticket.closed.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    @Operation(
        summary = "Reject a Claim Ticket",
        description = "Allows users to reject a claim ticket by providing the necessary details and reason for rejection.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Claim ticket rejected successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ResponseStatus.class)
                )
            )
        }
    )
    @PostMapping("/{ticketId}/reject")
    public ResponseEntity<ResponseStatus> rejectClaimTicket(
        @PathVariable Long ticketId, @Valid @RequestBody ClaimTicketRejectRequest claimTicketRejectRequest,
        HttpServletRequest request
    ) {
        RequestInfo requestInfo = new RequestInfo(request);
        sepsAndFiClaimTicketService.rejectClaimTicket(ticketId, claimTicketRejectRequest, requestInfo);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("claim.ticket.rejected.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    @PostMapping("/{ticketId}/reply-to-customer")
    public ResponseEntity<Void> replyToCustomer(@PathVariable Long ticketId,
        @ModelAttribute @Valid ClaimTicketReplyRequest claimTicketReplyRequest) {
        // Call service method to handle the reply
        sepsAndFiClaimTicketService.replyToCustomer(ticketId, claimTicketReplyRequest);

        return ResponseEntity.status(HttpStatus.OK).build();
    }
}
