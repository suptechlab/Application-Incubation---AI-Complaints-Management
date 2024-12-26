package com.seps.ticket.web.rest.v1;

import com.seps.ticket.aop.permission.PermissionCheck;
import com.seps.ticket.domain.ClaimTicket;
import com.seps.ticket.enums.ClaimTicketPriorityEnum;
import com.seps.ticket.enums.ClaimTicketStatusEnum;
import com.seps.ticket.service.ClaimTicketActivityLogService;
import com.seps.ticket.service.SepsAndFiClaimTicketService;
import com.seps.ticket.service.dto.*;
import com.seps.ticket.service.dto.ResponseStatus;
import com.seps.ticket.suptech.service.DocumentService;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import com.seps.ticket.web.rest.vm.ClaimTicketClosedRequest;
import com.seps.ticket.web.rest.vm.ClaimTicketFilterRequest;
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
import java.util.Map;

@Tag(name = "SEPS and FI Claim Ticket Management", description = "APIs for SEPS and FI to manage their Claim Tickets")
@RestController
@RequestMapping("/api/v1/seps-fi/claim-tickets")
public class SepsAndFiClaimTicketResource {

    private final SepsAndFiClaimTicketService sepsAndFiClaimTicketService;
    private final ClaimTicketActivityLogService claimTicketActivityLogService;
    private final MessageSource messageSource;
    private final DocumentService documentService;

    public SepsAndFiClaimTicketResource(SepsAndFiClaimTicketService sepsAndFiClaimTicketService, ClaimTicketActivityLogService claimTicketActivityLogService,
                                        MessageSource messageSource, DocumentService documentService) {
        this.sepsAndFiClaimTicketService =  sepsAndFiClaimTicketService;
        this.claimTicketActivityLogService = claimTicketActivityLogService;
        this.messageSource = messageSource;
        this.documentService = documentService;
    }

    @Operation(summary = "List all Claim Ticket", description = "Retrieve a paginated list of all claim tickets")
    @ApiResponse(responseCode = "200", description = "Claim Ticket List retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ClaimTicketDTO.class)))
    @GetMapping
    public ResponseEntity<List<ClaimTicketListDTO>> listSepsFiClaimTickets(Pageable pageable,
                                                                           @ModelAttribute ClaimTicketFilterRequest filterRequest) {
        Page<ClaimTicketListDTO> page = sepsAndFiClaimTicketService.listSepsAndFiClaimTickets(pageable, filterRequest);
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
    @PermissionCheck({"TICKET_ASSIGNED_TO_AGENT_FI"})
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
    @PermissionCheck({"TICKET_ASSIGNED_TO_AGENT_SEPS"})
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
    @PermissionCheck({"TICKET_PRIORITY_CHANGE_FI","TICKET_PRIORITY_CHANGE_SEPS"})
    public ResponseEntity<Void> updateClaimTicketPriority(
        @PathVariable Long ticketId,
        @RequestParam("priority") ClaimTicketPriorityEnum priority,
        HttpServletRequest request
    ) {
        RequestInfo requestInfo = new RequestInfo(request);
        sepsAndFiClaimTicketService.updatePriority(ticketId, priority, requestInfo);
        sepsAndFiClaimTicketService.triggerPriorityWorkflow(ticketId);
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
    @PermissionCheck({"TICKET_DATE_EXTENSION_FI","TICKET_DATE_EXTENSION_SEPS"})
    public ResponseEntity<ResponseStatus> extendClaimTicketSla(
        @PathVariable Long ticketId,
        @RequestParam("slaDate") String slaDate,
        @RequestParam(required = false) String reason,
        HttpServletRequest request) {
        try {
            LocalDate newSlaDate = LocalDate.parse(slaDate, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            RequestInfo requestInfo = new RequestInfo(request);
            sepsAndFiClaimTicketService.extendSlaDate(ticketId, newSlaDate, reason, requestInfo);
            sepsAndFiClaimTicketService.triggerDateExtensionWorkflow(ticketId);
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
    @PermissionCheck({"TICKET_CLOSED_FI","TICKET_CLOSED_SEPS"})
    public ResponseEntity<ResponseStatus> closeClaimTicket(
        @PathVariable Long ticketId, @ModelAttribute @Valid ClaimTicketClosedRequest claimTicketClosedRequest,
        HttpServletRequest request
    ) {
        RequestInfo requestInfo = new RequestInfo(request);
        // Delegate to service
        sepsAndFiClaimTicketService.closedClaimTicket(ticketId, claimTicketClosedRequest, requestInfo);
        sepsAndFiClaimTicketService.triggerCloseClaimTicketWorkflow(ticketId, claimTicketClosedRequest);
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
    @PermissionCheck({"TICKET_REJECT_FI","TICKET_REJECT_SEPS"})
    public ResponseEntity<ResponseStatus> rejectClaimTicket(
        @PathVariable Long ticketId, @ModelAttribute @Valid ClaimTicketRejectRequest claimTicketRejectRequest,
        HttpServletRequest request
    ) {
        RequestInfo requestInfo = new RequestInfo(request);
        sepsAndFiClaimTicketService.rejectClaimTicket(ticketId, claimTicketRejectRequest, requestInfo);
        sepsAndFiClaimTicketService.triggerRejectClaimTicketWorkflow(ticketId, claimTicketRejectRequest);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("claim.ticket.rejected.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    // Swagger documentation for reply-to-customer endpoint
    @Operation(
        summary = "Reply to Customer",
        description = "Allows a user to reply to a customer's ticket, optionally attaching files."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully replied to the customer's ticket.",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ResponseStatus.class)
            )
        )
    })
    @PostMapping("/{ticketId}/reply-to-customer")
    @PermissionCheck({"TICKET_REPLY_TO_CUSTOMER_FI","TICKET_REPLY_TO_CUSTOMER_SEPS"})
    public ResponseEntity<ResponseStatus> replyToCustomer(@PathVariable Long ticketId,
        @ModelAttribute @Valid ClaimTicketReplyRequest claimTicketReplyRequest) {
        // Call service method to handle the reply
        sepsAndFiClaimTicketService.replyToCustomer(ticketId, claimTicketReplyRequest);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("claim.ticket.replied.to.customer.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    @Operation(
        summary = "Reply to Internal",
        description = "Allows a user to reply to internal ticket discussions, optionally attaching files."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully replied to the internal discussion.",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ResponseStatus.class)
            )
        )
    })
    @PostMapping("/{ticketId}/reply-to-internal")
    @PermissionCheck({"TICKET_REPLY_TO_INTERNAL_FI","TICKET_REPLY_TO_INTERNAL_SEPS"})
    public ResponseEntity<ResponseStatus> replyToInternal(@PathVariable Long ticketId,
                                                          @ModelAttribute @Valid ClaimTicketReplyRequest claimTicketReplyRequest) {
        // Call service method to handle the reply
        sepsAndFiClaimTicketService.replyToInternal(ticketId, claimTicketReplyRequest);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("claim.ticket.replied.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable("id") String documentId) {
        return documentService.downloadDocument(documentId);
    }

    @Operation(
        summary = "Add Internal Note",
        description = "Allows a user to add internal note ticket discussions, optionally attaching files."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully added internal note.",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ResponseStatus.class)
            )
        )
    })
    @PostMapping("/{ticketId}/add-internal-note")
    @PermissionCheck({"TICKET_INTERNAL_NOTE_FI","TICKET_INTERNAL_NOTE_SEPS"})
    public ResponseEntity<ResponseStatus> replyToInternalNote(@PathVariable Long ticketId,
                                                          @ModelAttribute @Valid ClaimTicketReplyRequest claimTicketReplyRequest) {
        // Call service method to handle the reply
        sepsAndFiClaimTicketService.replyToInternalNote(ticketId, claimTicketReplyRequest);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("claim.ticket.internal.note.added.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    @GetMapping("/{id}/test")
    public ResponseEntity<Map<String, String>> getSepsFiClaimTicketByIdTest(@PathVariable Long id) {
        return ResponseEntity.ok(sepsAndFiClaimTicketService.getSepsFiClaimTicketByIdTest(id));
    }

    @Operation(summary = "Update Claim Ticket Status", description = "Update the status of a specific claim ticket (IN_PROGRESS, PENDING)")
    @ApiResponse(responseCode = "200", description = "Claim ticket status updated successfully")
    @PatchMapping("/{ticketId}/change-status")
    @PermissionCheck({"TICKET_CHANGE_STATUS_BY_SEPS","TICKET_CHANGE_STATUS_BY_FI"})
    public ResponseEntity<ResponseStatus> changeClaimTicketStatus(
        @PathVariable Long ticketId,
        @RequestParam("status") ClaimTicketStatusEnum status,
        HttpServletRequest request
    ) {
        // Validate that only IN_PROGRESS and PENDING are allowed
        if (status != ClaimTicketStatusEnum.IN_PROGRESS && status != ClaimTicketStatusEnum.PENDING) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_ALLOW_ONLY_STATUS,
                new String[]{ClaimTicketStatusEnum.IN_PROGRESS.name() + ", "+ ClaimTicketStatusEnum.PENDING.name()},
                null);
        }
        RequestInfo requestInfo = new RequestInfo(request);
        sepsAndFiClaimTicketService.updateTicketStatus(ticketId, status, requestInfo);
        sepsAndFiClaimTicketService.triggerChangeStatusWorkflow(ticketId);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("claim.ticket.status.changed.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }
}
