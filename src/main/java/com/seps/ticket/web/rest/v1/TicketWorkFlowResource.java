package com.seps.ticket.web.rest.v1;

import com.seps.ticket.service.TicketWorkFlowService;
import com.seps.ticket.service.dto.ResponseStatus;
import com.seps.ticket.service.dto.workflow.TicketWorkflowDTO;
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

@RestController
@RequestMapping("/api/v1/ticket-work-flow")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SEPS_USER','ROLE_FI_USER')")
public class TicketWorkFlowResource {

    private static final Logger LOG = LoggerFactory.getLogger(TicketWorkFlowResource.class);

    private final TicketWorkFlowService ticketWorkFlowService;
    private final MessageSource messageSource;

    public TicketWorkFlowResource(TicketWorkFlowService ticketWorkFlowService, MessageSource messageSource) {
        this.ticketWorkFlowService = ticketWorkFlowService;
        this.messageSource = messageSource;
    }

    @PostMapping
    public ResponseEntity<ResponseStatus> createTicketWorkFlow(@Valid @RequestBody TicketWorkflowDTO ticketWorkflowDTO) {
        LOG.debug("Current user authorities: {}", SecurityContextHolder.getContext().getAuthentication().getAuthorities());
        ticketWorkFlowService.createTicketWorkFlow(ticketWorkflowDTO);
        ResponseStatus responseStatus = new ResponseStatus(messageSource.getMessage("ticket.workflow.created.successfully",
            null, LocaleContextHolder.getLocale()), HttpStatus.OK.value(), System.currentTimeMillis());
        return ResponseEntity.ok(responseStatus);
    }

}
