package com.seps.ticket.web.rest.v1;

import com.seps.ticket.service.MailService;
import com.seps.ticket.service.UserClaimTicketService;
import com.seps.ticket.service.dto.RequestInfo;
import com.seps.ticket.service.dto.UserClaimTicketDTO;
import com.seps.ticket.service.dto.ClaimTicketResponseDTO;
import com.seps.ticket.web.rest.vm.ClaimTicketRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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

    public UserClaimTicketResource(UserClaimTicketService userClaimTicketService, MailService mailService) {
        this.userClaimTicketService = userClaimTicketService;
        this.mailService = mailService;
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
    @PostMapping("/file-claim")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<ClaimTicketResponseDTO> fileClaimTicket(@RequestBody @Valid ClaimTicketRequest claimTicketRequest,
                                                                  HttpServletRequest httpServletRequest) {
        RequestInfo requestInfo = new RequestInfo(httpServletRequest);
        ClaimTicketResponseDTO claimTicketResponseDTO = userClaimTicketService.fileClaimTicket(claimTicketRequest, requestInfo);
        if (claimTicketResponseDTO.getNewId() != null) {
            UserClaimTicketDTO userClaimTicketDTO = userClaimTicketService.getUserClaimTicketById(claimTicketResponseDTO.getNewId());
            mailService.sendClaimTicketCreationEmail(userClaimTicketDTO);
        }
        return ResponseEntity.status(HttpStatus.OK).body(claimTicketResponseDTO);
    }

    @Operation(summary = "Get a Claim by ID", description = "Retrieve a claim by its ID")
    @ApiResponse(responseCode = "200", description = "Claim retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = UserClaimTicketDTO.class)))
    @GetMapping("/{id}")
    public ResponseEntity<UserClaimTicketDTO> getClaimTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(userClaimTicketService.getUserClaimTicketById(id));
    }

    @Operation(summary = "List all Claim Ticket", description = "Retrieve a paginated list of all claim tickets")
    @ApiResponse(responseCode = "200", description = "Claim Ticket List retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = UserClaimTicketDTO.class)))
    @GetMapping
    public ResponseEntity<List<UserClaimTicketDTO>> listClaimTickets(Pageable pageable,
                                                                     @Parameter(description = "Filter by year", required = false) Integer year) {
        Page<UserClaimTicketDTO> page = userClaimTicketService.listClaimTickets(pageable, year);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
