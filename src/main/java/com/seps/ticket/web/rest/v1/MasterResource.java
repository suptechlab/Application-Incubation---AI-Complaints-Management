package com.seps.ticket.web.rest.v1;

import com.seps.ticket.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/masters")
@Tag(name = "Masters", description = "Operations related to Master APIs.")
public class MasterResource {

    private final MasterDataService masterDataService;

    public MasterResource(MasterDataService masterDataService) {
        this.masterDataService = masterDataService;
    }



    @Operation(
        summary = "Retrieve master data for various enums",
        description = "Fetches a map of key-value pairs representing master data for enums such as Customer Type and Priority Care Group. "
            + "The data is localized based on the current locale context."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved master data",
            content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping
    public ResponseEntity<Map<String, Object>> getMasterData() {
        Map<String, Object> masterData = masterDataService.getMasterData(LocaleContextHolder.getLocale());
        return ResponseEntity.ok(masterData);
    }


}
