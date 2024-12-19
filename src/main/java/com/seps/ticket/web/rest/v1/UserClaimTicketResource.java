package com.seps.ticket.web.rest.v1;

import com.seps.ticket.domain.User;
import com.seps.ticket.service.*;
import com.seps.ticket.service.dto.*;
import com.seps.ticket.service.dto.ResponseStatus;
import com.seps.ticket.service.dto.workflow.ClaimTicketWorkFlowDTO;
import com.seps.ticket.service.dto.workflow.CreateAction;
import com.seps.ticket.suptech.service.DocumentService;
import com.seps.ticket.web.rest.vm.ClaimTicketReplyRequest;
import com.seps.ticket.web.rest.vm.ClaimTicketRequest;
import com.seps.ticket.web.rest.vm.ComplaintRequest;
import com.seps.ticket.web.rest.vm.SecondInstanceRequest;
import com.seps.ticket.web.rest.vm.UploadDocumentRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;

import java.util.List;

@Tag(name = "User Claim Ticket Management", description = "APIs for Users to manage their Claim Tickets")
@RestController
@RequestMapping("/api/v1/user/claim-tickets")
public class UserClaimTicketResource {

    private final UserClaimTicketService userClaimTicketService;
    private final MailService mailService;
    private final DocumentService documentService;
    private final MessageSource messageSource;
    private final ClaimTicketActivityLogService claimTicketActivityLogService;
    private final ClaimTicketWorkFlowService claimTicketWorkFlowService;
    private final TemplateVariableMappingService templateVariableMappingService;
    private final UserService userService;

    public UserClaimTicketResource(UserClaimTicketService userClaimTicketService, MailService mailService, DocumentService documentService,
                                   MessageSource messageSource, ClaimTicketActivityLogService claimTicketActivityLogService, ClaimTicketWorkFlowService claimTicketWorkFlowService, TemplateVariableMappingService templateVariableMappingService, UserService userService) {
        this.userClaimTicketService = userClaimTicketService;
        this.mailService = mailService;
        this.documentService = documentService;
        this.messageSource = messageSource;
        this.claimTicketActivityLogService = claimTicketActivityLogService;
        this.claimTicketWorkFlowService = claimTicketWorkFlowService;
        this.templateVariableMappingService = templateVariableMappingService;
        this.userService = userService;
    }

    @Operation(
        summary = "File a claim API",
        description = "Allows a user to file a claim.",
        tags = {"File Claim"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Claim filed successfully.",
            content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = ClaimTicketResponseDTO.class))),
        @ApiResponse(responseCode = "403", description = "Access forbidden"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping("/file-claim")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<ClaimTicketResponseDTO> fileClaimTicket(@ModelAttribute @Valid ClaimTicketRequest claimTicketRequest,
                                                                  HttpServletRequest httpServletRequest) {
        RequestInfo requestInfo = new RequestInfo(httpServletRequest);
        ClaimTicketResponseDTO claimTicketResponseDTO = userClaimTicketService.fileClaimTicket(claimTicketRequest, requestInfo);
        if (claimTicketResponseDTO.getNewId() != null) {
            if (claimTicketResponseDTO.getClaimTicketWorkFlowId() == null) {
                handleSimpleFileClaimTicket(claimTicketResponseDTO.getNewId());
            } else {
                handleWorkflowClaimTicket(claimTicketResponseDTO.getNewId(), claimTicketResponseDTO.getClaimTicketWorkFlowId());
            }
        }
        return ResponseEntity.status(HttpStatus.OK).body(claimTicketResponseDTO);
    }

    private void handleSimpleFileClaimTicket(Long newTicketId) {
        UserClaimTicketDTO userClaimTicketDTO = userClaimTicketService.getUserClaimTicketById(newTicketId);
        mailService.sendClaimTicketCreationEmail(userClaimTicketDTO);
    }

    private void handleWorkflowClaimTicket(Long claimTicketId, Long workflowId) {
        ClaimTicketDTO claimTicketDTO = userClaimTicketService.findClaimTicketById(claimTicketId);
        if (claimTicketDTO == null) {
            return;
        }
        ClaimTicketWorkFlowDTO claimTicketWorkFlowDTO = claimTicketWorkFlowService.findClaimTicketWorkFlowById(workflowId);
        if (claimTicketWorkFlowDTO == null) {
            return;
        }
        if (claimTicketWorkFlowDTO.getCreateActions().isEmpty()) {
            return;
        }

        for (CreateAction createAction : claimTicketWorkFlowDTO.getCreateActions()) {
            Long agentId = createAction.getAgentId();
            Long templateId = createAction.getTemplateId();
            User user = null;
            switch (createAction.getAction()) {
                case MAIL_TO_CUSTOMER:
                    user = userService.findUserById(claimTicketDTO.getUserId());
                    break;
                case MAIL_TO_FI_TEAM:
                case MAIL_TO_FI_AGENT:
                    user = claimTicketWorkFlowService.findFIUserForMailAction(agentId, claimTicketWorkFlowDTO);
                    break;
                case MAIL_TO_SEPS_TEAM:
                case MAIL_TO_SEPS_AGENT:
                    user = claimTicketWorkFlowService.findSEPSUserForMailAction(agentId, claimTicketWorkFlowDTO);
                    break;
                // Add other cases if needed
                default:
                    // Handle unsupported actions or log them
                    break;
            }
            if (user != null && templateId != null) {
                MailDTO mailDTO = new MailDTO();
                mailDTO.setTemplateId(templateId);
                mailDTO.setTo(user.getEmail());
                mailDTO.setLocale(user.getLangKey());
                mailDTO.setIsStatic(false);
                mailDTO.setDataVariables(templateVariableMappingService.mapVariables(claimTicketDTO, user));
                mailService.sendDynamicContentEmail(mailDTO);
            }
        }
    }


    @Operation(summary = "List all Claim Tickets", description = "Retrieve a paginated list of all claim tickets")
    @ApiResponse(responseCode = "200", description = "Claim Ticket List retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = UserClaimTicketDTO.class)))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "403", description = "Access forbidden"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<List<UserClaimTicketDTO>> listUserClaimTickets(Pageable pageable,
                                                                         @Parameter(description = "Filter by year") Integer year) {
        Page<UserClaimTicketDTO> page = userClaimTicketService.listUserClaimTickets(pageable, year);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @Operation(summary = "Get a Claim by ID", description = "Retrieve a claim by its ID")
    @ApiResponse(responseCode = "200", description = "Claim retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = UserClaimTicketDTO.class)))
    @ApiResponses(value = {
        @ApiResponse(responseCode = "403", description = "Access forbidden"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<UserClaimTicketDTO> getUserClaimTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(userClaimTicketService.getUserClaimTicketById(id));
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
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<ClaimStatusCountResponseDTO> countClaimsByStatusAndTotal(
        @Parameter(description = "Filter by year") @RequestParam(required = false) Integer year) {
        ClaimStatusCountResponseDTO count = userClaimTicketService.countClaimsByStatusAndTotal(year);
        return ResponseEntity.ok(count);
    }

    // Endpoint for uploading document
    @PostMapping("/upload")
    public ResponseEntity<String> uploadDocument(@Valid @ModelAttribute UploadDocumentRequest request) {
        return userClaimTicketService.uploadDocument(request);
    }

    // Endpoint for downloading a document
    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable("id") String documentId) {
        return documentService.downloadDocument(documentId);
    }

    @Operation(
        summary = "File a second instance of claim API",
        description = "Allows a user to file a second instance.",
        tags = {"File a second instance of claim"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Second instance of claim filed successfully.",
            content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = ClaimTicketResponseDTO.class))),
        @ApiResponse(responseCode = "403", description = "Access forbidden"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping("/file-second-instance-claim")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<ResponseStatus> fileSecondInstanceClaim(@ModelAttribute @Valid SecondInstanceRequest secondInstanceRequest,
                                                                  HttpServletRequest httpServletRequest) {
        Long id = secondInstanceRequest.getId();
        RequestInfo requestInfo = new RequestInfo(httpServletRequest);
        UserClaimTicketDTO prevUserClaimTicketDTO = userClaimTicketService.getUserClaimTicketById(id);
        // File the claim
        userClaimTicketService.fileSecondInstanceClaim(secondInstanceRequest, requestInfo);
        // Retrieve the claim ticket
        UserClaimTicketDTO userClaimTicketDTO = userClaimTicketService.getUserClaimTicketById(id);
        // Send an email notification
        mailService.sendSecondInstanceClaimEmail(prevUserClaimTicketDTO, userClaimTicketDTO);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("second.instance.filed.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }


    @Operation(
        summary = "Reply to a claim ticket",
        description = "Allows a customer to reply to a claim ticket with a message and optional attachments."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reply posted successfully.",
            content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = ResponseStatus.class))),
        @ApiResponse(responseCode = "400", description = "Bad request or invalid ticket status"),
        @ApiResponse(responseCode = "403", description = "Access forbidden"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")

    })

    @PostMapping("/{id}/reply-on-ticket")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<ResponseStatus> replyCustomerOnTicket(@PathVariable Long id,
                                                                @ModelAttribute @Valid ClaimTicketReplyRequest claimTicketReplyRequest) {

        // Call service method to handle the reply
        userClaimTicketService.replyOnTicket(id, claimTicketReplyRequest);
        userClaimTicketService.sendCustomerReplyEmail(id, claimTicketReplyRequest);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("claim.ticket.replied.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }


    @Operation(
        summary = "Get list of conversations for a claim ticket",
        description = "Retrieves a paginated list of activity logs for the specified claim ticket."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Conversations retrieved successfully.",
            content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = ClaimTicketActivityLogDTO.class))),
        @ApiResponse(responseCode = "400", description = "Bad request or invalid ticket ID"),
        @ApiResponse(responseCode = "404", description = "Claim ticket not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")

    })
    @GetMapping("/{id}/conversations-list")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<List<ClaimTicketActivityLogDTO>> claimTicketsConversationList(@PathVariable Long id, Pageable pageable) {
        Page<ClaimTicketActivityLogDTO> page = claimTicketActivityLogService.getAllConversation(id, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());

    }

    @PostMapping("/file-complaint")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<ResponseStatus> fileComplaint(@ModelAttribute @Valid ComplaintRequest complaintRequest,
                                                        HttpServletRequest httpServletRequest) {
        Long id = complaintRequest.getId();
        RequestInfo requestInfo = new RequestInfo(httpServletRequest);
        // Raise the complaint
        userClaimTicketService.fileComplaint(complaintRequest, requestInfo);
        // Retrieve the claim ticket
        UserClaimTicketDTO userClaimTicketDTO = userClaimTicketService.getUserClaimTicketById(id);
        // Send an email notification
        mailService.sendComplaintEmail(userClaimTicketDTO);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("complaint.raised.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }
}
