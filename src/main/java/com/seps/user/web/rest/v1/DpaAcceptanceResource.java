package com.seps.user.web.rest.v1;

import com.seps.user.service.DpaAcceptanceService;
import com.seps.user.service.dto.ResponseStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dpa")
@Tag(name = "DPA Acceptance", description = "API for handling Data Processing Agreement (DPA) acceptance and decline.")
public class DpaAcceptanceResource {

    private final DpaAcceptanceService dpaAcceptanceService;
    private final MessageSource messageSource;

    public DpaAcceptanceResource(DpaAcceptanceService dpaAcceptanceService, MessageSource messageSource) {
        this.dpaAcceptanceService = dpaAcceptanceService;
        this.messageSource = messageSource;
    }

    /**
     * Endpoint for accepting or declining the Data Processing Agreement (DPA).
     *
     * @param status  the acceptance status (true if the user accepts, false if declined).
     * @param request the HTTP servlet request containing client information.
     * @return ResponseEntity with a response status message.
     */
    @Operation(
        summary = "Accept or Decline DPA",
        description = "Allows a user to accept or decline the Data Processing Agreement (DPA).",
        tags = { "DPA Acceptance" }
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "DPA acceptance status saved successfully.",
            content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = ResponseStatus.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input or missing parameters.",
            content = @Content(mediaType = "application/json")),
        @ApiResponse(responseCode = "500", description = "Internal server error.",
            content = @Content(mediaType = "application/json"))
    })
    @PostMapping("/accept/{status}")
    public ResponseEntity<ResponseStatus> acceptDpa(
        @Parameter(description = "Acceptance status of the DPA. 'true' for accepted, 'false' for declined.", example = "true")
        @PathVariable(required = false) Boolean status,
        HttpServletRequest request) {

        // Save the acceptance data
        dpaAcceptanceService.acceptDpa(status, request);

        // Create the response status
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage(
                Boolean.TRUE.equals(status) ? "dpa.accepted.successfully" : "dpa.declined",
                null, LocaleContextHolder.getLocale()
            ),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );

        // Return the response entity
        return ResponseEntity.ok(responseStatus);
    }
}
