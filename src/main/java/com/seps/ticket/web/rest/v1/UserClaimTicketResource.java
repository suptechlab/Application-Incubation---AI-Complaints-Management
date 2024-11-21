package com.seps.ticket.web.rest.v1;

import com.seps.ticket.service.ClaimTicketService;
import com.seps.ticket.service.dto.TicketDTO;
import com.seps.ticket.web.rest.vm.ClaimTicketRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "User Claim Ticket Management", description = "APIs for Users to manage their Claim Tickets")
@RestController
@RequestMapping("/api/v1/user/claim-tickets")
public class UserClaimTicketResource {

    private final ClaimTicketService claimTicketService;

    public UserClaimTicketResource(ClaimTicketService claimTicketService) {
        this.claimTicketService = claimTicketService;
    }

    // Endpoint for Users to create a claim ticket
    @PostMapping("/file-claim")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<TicketDTO> fileClaim(@RequestBody @Valid ClaimTicketRequest claimTicketRequest) {
        TicketDTO createdTicket = claimTicketService.createTicket(claimTicketRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTicket);
    }

}
