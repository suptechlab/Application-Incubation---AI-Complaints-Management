package com.seps.ticket.web.rest.v1;

import com.seps.ticket.service.ClaimTicketWorkFlowService;
import com.seps.ticket.service.dto.ResponseStatus;
import com.seps.ticket.service.dto.workflow.ClaimTicketWorkFlowDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

@RestController
@RequestMapping("/api/v1/claim-ticket-work-flow")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SEPS_USER','ROLE_FI_USER')")
public class ClaimTicketWorkFlowResource {

    private static final Logger LOG = LoggerFactory.getLogger(ClaimTicketWorkFlowResource.class);

    private final ClaimTicketWorkFlowService claimTicketWorkFlowService;
    private final MessageSource messageSource;

    public ClaimTicketWorkFlowResource(ClaimTicketWorkFlowService claimTicketWorkFlowService, MessageSource messageSource) {
        this.claimTicketWorkFlowService = claimTicketWorkFlowService;
        this.messageSource = messageSource;
    }

    @Operation(summary = "Create a new ticket work flow", description = "Add a new ticket workflow with the specified details")
    @ApiResponse(responseCode = "201", description = "Ticket workflow created successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ResponseStatus.class)))
    @PostMapping
    public ResponseEntity<ResponseStatus> createClaimTicketWorkFlow(@Valid @RequestBody ClaimTicketWorkFlowDTO claimTicketWorkflowDTO)
        throws URISyntaxException {
        LOG.debug("Current user authorities: {}", SecurityContextHolder.getContext().getAuthentication().getAuthorities());
        Long id = claimTicketWorkFlowService.createClaimTicketWorkFlow(claimTicketWorkflowDTO);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("claim.ticket.workflow.created.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.CREATED.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.created(new URI("/api/v1/claim-ticket-work-flow/" + id))
            .body(responseStatus);
    }

    @Operation(summary = "Get a Claim Ticket Workflow by ID", description = "Retrieve a claim ticket workflow by its ID")
    @ApiResponse(responseCode = "200", description = "Ticket workflow retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ClaimTicketWorkFlowDTO.class)))
    @GetMapping("/{id}")
    public ResponseEntity<ClaimTicketWorkFlowDTO> getClaimTicketWorkFlowById(@PathVariable Long id) {
        return ResponseEntity.ok(claimTicketWorkFlowService.getClaimTicketWorkFlowById(id));
    }

}
