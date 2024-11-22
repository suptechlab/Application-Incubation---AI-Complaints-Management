package com.seps.ticket.web.rest.v1;

import com.seps.ticket.service.UserClaimTicketService;
import com.seps.ticket.service.dto.ClaimTicketResponseDTO;
import com.seps.ticket.web.rest.vm.ClaimTicketRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

    private final UserClaimTicketService userClaimTicketService;

    public UserClaimTicketResource(UserClaimTicketService userClaimTicketService) {
        this.userClaimTicketService = userClaimTicketService;
    }


    @Operation(
        summary = "File a claim API",
        description = "Allows a user to file a claim.",
        tags = {"File Claim"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Claimed file successfully.",
            content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = ClaimTicketResponseDTO.class))),
    })
    // Endpoint for Users to create a claim ticket
    @PostMapping("/file-claim")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<ClaimTicketResponseDTO> fileClaim(@RequestBody @Valid ClaimTicketRequest claimTicketRequest) {
        ClaimTicketResponseDTO claimTicketResponseDTO = userClaimTicketService.fileClaim(claimTicketRequest);
        return ResponseEntity.status(HttpStatus.OK).body(claimTicketResponseDTO);
    }

}
