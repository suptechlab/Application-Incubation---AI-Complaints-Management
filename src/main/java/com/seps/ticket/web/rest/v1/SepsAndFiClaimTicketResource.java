package com.seps.ticket.web.rest.v1;

import com.seps.ticket.aop.permission.PermissionCheck;
import com.seps.ticket.domain.ClaimTicket;
import com.seps.ticket.domain.ClaimTicketOTP;
import com.seps.ticket.enums.ClaimTicketPriorityEnum;
import com.seps.ticket.enums.ClaimTicketStatusEnum;
import com.seps.ticket.service.*;
import com.seps.ticket.service.dto.*;
import com.seps.ticket.service.dto.ResponseStatus;
import com.seps.ticket.suptech.service.DocumentService;
import com.seps.ticket.suptech.service.dto.PersonInfoDTO;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import com.seps.ticket.web.rest.vm.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.thymeleaf.context.Context;
import org.zalando.problem.Status;
import tech.jhipster.web.util.PaginationUtil;


import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;


@Tag(name = "SEPS and FI Claim Ticket Management", description = "APIs for SEPS and FI to manage their Claim Tickets")
@RestController
@RequestMapping("/api/v1/seps-fi/claim-tickets")
public class SepsAndFiClaimTicketResource {

    private static final Logger LOG = LoggerFactory.getLogger(SepsAndFiClaimTicketResource.class);

    private final SepsAndFiClaimTicketService sepsAndFiClaimTicketService;
    private final ClaimTicketActivityLogService claimTicketActivityLogService;
    private final MessageSource messageSource;
    private final DocumentService documentService;
    private final ClaimTicketService claimTicketService;
    private final ClaimTicketOTPService claimTicketOTPService;
    private final MailService mailService;
    private final PdfService pdfService;
    public SepsAndFiClaimTicketResource(SepsAndFiClaimTicketService sepsAndFiClaimTicketService, ClaimTicketActivityLogService claimTicketActivityLogService,
                                        MessageSource messageSource, DocumentService documentService, ClaimTicketService claimTicketService, ClaimTicketOTPService claimTicketOTPService, MailService mailService, PdfService pdfService) {
        this.sepsAndFiClaimTicketService = sepsAndFiClaimTicketService;
        this.claimTicketActivityLogService = claimTicketActivityLogService;
        this.messageSource = messageSource;
        this.documentService = documentService;
        this.claimTicketService = claimTicketService;
        this.claimTicketOTPService = claimTicketOTPService;
        this.mailService = mailService;
        this.pdfService = pdfService;
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
        claimTicketService.sendAssignmentNotification(ticketList, agentId);
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
        claimTicketService.sendAssignmentNotification(ticketList, agentId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Update Claim Ticket Priority", description = "Update the priority of a specific claim ticket")
    @ApiResponse(responseCode = "200", description = "Claim ticket priority updated successfully")
    @PatchMapping("/{ticketId}/priority")
    @PermissionCheck({"TICKET_PRIORITY_CHANGE_FI", "TICKET_PRIORITY_CHANGE_SEPS"})
    public ResponseEntity<Void> updateClaimTicketPriority(
        @PathVariable Long ticketId,
        @RequestParam("priority") ClaimTicketPriorityEnum priority,
        HttpServletRequest request
    ) {
        RequestInfo requestInfo = new RequestInfo(request);
        sepsAndFiClaimTicketService.updatePriority(ticketId, priority, requestInfo);
        sepsAndFiClaimTicketService.triggerPriorityWorkflow(ticketId);
        claimTicketService.sendPriorityChangeNotification(ticketId);
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
    @PermissionCheck({"TICKET_DATE_EXTENSION_FI", "TICKET_DATE_EXTENSION_SEPS"})
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
    @PermissionCheck({"TICKET_CLOSED_FI", "TICKET_CLOSED_SEPS"})
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
    @PermissionCheck({"TICKET_REJECT_FI", "TICKET_REJECT_SEPS"})
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
    @PermissionCheck({"TICKET_REPLY_TO_CUSTOMER_FI", "TICKET_REPLY_TO_CUSTOMER_SEPS"})
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
    @PermissionCheck({"TICKET_REPLY_TO_INTERNAL_FI", "TICKET_REPLY_TO_INTERNAL_SEPS"})
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
    @PermissionCheck({"TICKET_INTERNAL_NOTE_FI", "TICKET_INTERNAL_NOTE_SEPS"})
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
    @PermissionCheck({"TICKET_CHANGE_STATUS_BY_SEPS", "TICKET_CHANGE_STATUS_BY_FI"})
    public ResponseEntity<ResponseStatus> changeClaimTicketStatus(
        @PathVariable Long ticketId,
        @RequestParam("status") ClaimTicketStatusEnum status,
        HttpServletRequest request
    ) {
        // Validate that only IN_PROGRESS and PENDING are allowed
        if (status != ClaimTicketStatusEnum.IN_PROGRESS && status != ClaimTicketStatusEnum.PENDING) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_ALLOW_ONLY_STATUS,
                new String[]{ClaimTicketStatusEnum.IN_PROGRESS.name() + ", " + ClaimTicketStatusEnum.PENDING.name()},
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

    @Operation(summary = "Retrieve list of agents for Tagging", description = "Get a list of agents available for ticket tagging")
    @ApiResponse(responseCode = "200", description = "Agent list retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = DropdownListDTO.class)))
    @GetMapping("/{ticketId}/agents-for-tag")
    public ResponseEntity<List<DropdownListAgentForTagDTO>> getAgentListForTag(@PathVariable Long ticketId) {
        return ResponseEntity.ok(claimTicketService.getAgentListForTagging(ticketId));
    }

    @Operation(
        summary = "Validate user identificacion for claim ticket",
        description = "Checks if the provided user identificacion is valid for creating a claim ticket."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Identificacion validation result.",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = PersonInfoDTO.class)
            )
        )
    })
    @GetMapping("/validate-identificacion")
    public ResponseEntity<PersonInfoDTO> validateClaimTicketIdentificacion(@RequestParam(name = "identificacion") String identificacion) {
        return ResponseEntity.ok(claimTicketService.validateClaimTicketIdentificacion(identificacion));
    }


    @Operation(
        summary = "Validate user email for claim ticket",
        description = "Checks if the provided user email is valid for creating a claim ticket."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Email validation result.",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Boolean.class)
            )
        )
    })
    @PostMapping("/validate-user-email")
    public ResponseEntity<Boolean> validateClaimTicketUserEmail(@Valid @RequestBody EmailRequest emailRequest) {
        String email = emailRequest.getEmail();
        return ResponseEntity.ok(claimTicketService.validateClaimTicketUserEmail(email));
    }

    @Operation(
        summary = "Generate and send OTP for claim ticket",
        description = "Generates a One-Time Password (OTP) for the specified email address and sends it to the user's email. " +
            "This OTP is required for creating a claim ticket."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "OTP successfully sent to the email address.",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ResponseStatus.class)
            )
        )
    })
    @PostMapping("/request-otp")
    public ResponseEntity<ResponseStatus> requestOTP(@RequestBody @Valid RequestOTPVM requestOTPVM) {
        String email = requestOTPVM.getEmail().toLowerCase();
        ClaimTicketOTP otp = claimTicketOTPService.generateOtp(email);
        mailService.sendClaimTicketOTPEmail(otp, LocaleContextHolder.getLocale());
        return new ResponseEntity<>(new ResponseStatus(
            messageSource.getMessage("otp.sent.to.email", new Object[]{email}, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        ), HttpStatus.OK);
    }


    @Operation(
        summary = "Verify OTP for claim ticket",
        description = "Validates the provided One-Time Password (OTP) for the specified email address. " +
            "If the OTP is valid, it indicates successful verification; otherwise, an error is returned."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "204",
            description = "OTP successfully verified."
        )
    })
    @PostMapping("/verify-otp")
    public ResponseEntity<Void> verifyOTP(@Valid @RequestBody VerifyOTPVM verifyOTPVM) {
        String email = verifyOTPVM.getEmail().toLowerCase();
        String otpCode = verifyOTPVM.getOtpCode();
        Boolean isVerified = claimTicketOTPService.verifyOtp(email, otpCode);
        if (Boolean.FALSE.equals(isVerified)) {
            LOG.error("Invalid OTP code for token: {}", otpCode);
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_OTP_CODE, null, null);
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }


    @Operation(summary = "Create a new claim", description = "A new claim created by Either SEPS or FI User")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Claim created successfully.",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ClaimTicketResponseDTO.class)
            )
        )
    })
    @PostMapping
    @PermissionCheck({"TICKET_CREATED_BY_SEPS", "TICKET_CREATED_BY_FI"})
    public ResponseEntity<ClaimTicketResponseDTO> createClaimTicket(@ModelAttribute @Valid CreateClaimTicketRequest claimTicketRequest,
                                                                    HttpServletRequest request) {
        RequestInfo requestInfo = new RequestInfo(request);
        ClaimTicketResponseDTO claimTicketResponseDTO = claimTicketService.createClaimTicket(claimTicketRequest, requestInfo);
        if (claimTicketResponseDTO.getNewId() != null) {
            UserClaimTicketDTO userClaimTicketDTO = claimTicketService.getUserClaimTicketById(claimTicketResponseDTO.getNewId());
            mailService.sendClaimTicketCreationEmail(userClaimTicketDTO);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(claimTicketResponseDTO);
    }

    @Operation(summary = "List all Claim Ticket For tagged user", description = "Retrieve a paginated list of all claim tickets")
    @ApiResponse(responseCode = "200", description = "Claim Ticket List retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ClaimTicketDTO.class)))
    @GetMapping("/for-tagged-users")
    public ResponseEntity<List<ClaimTicketListDTO>> listSepsFiClaimTicketsForTaggedUser(Pageable pageable,
                                                                                        @ModelAttribute ClaimTicketFilterRequest filterRequest) {
        Page<ClaimTicketListDTO> page = claimTicketService.listSepsAndFiClaimTicketsForTaggedUser(pageable, filterRequest);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @Operation(
        summary = "Save SLA comment",
        description = "Saves an SLA comment for the specified claim ticket."
    )
    @PostMapping("/{ticketId}/sla-comment")
    public ResponseEntity<ResponseStatus> slaCommentSave(@PathVariable Long ticketId,
                                                         @Valid @RequestBody ClaimTicketSlaCommentRequest claimTicketSlaCommentRequest,
                                                         HttpServletRequest request) {
        RequestInfo requestInfo = new RequestInfo(request);
        claimTicketService.saveSlaComment(ticketId, claimTicketSlaCommentRequest, requestInfo);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("claim.ticket.sla.commented.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    @Operation(
        summary = "Dismiss SLA popup",
        description = "Dismisses the SLA popup for the specified claim ticket."
    )
    @PatchMapping("/{ticketId}/dismiss-sla-popup")
    public ResponseEntity<Void> dismissalSLAPopup(@PathVariable Long ticketId) {
        claimTicketService.dismissalSLACommentPopup(ticketId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @Operation(
        summary = "Update Claim Ticket",
        description = "Update the claim ticket for the specified claim ticket."
    )
    @PutMapping("/{ticketId}/update")
    @PermissionCheck({"TICKET_UPDATED_BY_SEPS", "TICKET_UPDATED_BY_FI"})
    public ResponseEntity<ResponseStatus> updateClaimTicketDetails(@PathVariable Long ticketId,
                                                                   @Valid @RequestBody ClaimTicketUpdateRequest claimTicketUpdateRequest,
                                                                   HttpServletRequest request) {
        RequestInfo requestInfo = new RequestInfo(request);
        // Update ticket details
        claimTicketService.updateClaimTicketDetails(ticketId, claimTicketUpdateRequest, requestInfo);
        // Create success response
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("claim.ticket.updated.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    @GetMapping("/{ticketId}/pdf-download")
    @PermissionCheck({"TICKET_DOWNLOAD_PDF_SEPS", "TICKET_DOWNLOAD_PDF_FI"})
    public ResponseEntity<byte[]> downloadClaimTicketDetails(@PathVariable Long ticketId,
                                                                   HttpServletRequest request) throws IOException {
        RequestInfo requestInfo = new RequestInfo(request);

        Context context = claimTicketService.getTicketDetailContext(ticketId, requestInfo);
        // Generate PDF
        byte[] pdfBytes = pdfService.generatePdf("ticket", context);

        // Return as PDF download
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ticket_detail.pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdfBytes);
    }

}
