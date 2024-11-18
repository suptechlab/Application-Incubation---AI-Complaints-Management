package com.seps.user.web.rest.v1;

import com.seps.user.service.*;
import com.seps.user.service.dto.DropdownListDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/masters")
@Tag(name = "Masters", description = "Operations related to Master APIs.")
public class MasterResource {

    private final InquiryTypeService inquiryTypeService;
    private final ClaimTypeService claimTypeService;
    private final InquirySubTypeService inquirySubTypeService;
    private final ClaimSubTypeService claimSubTypeService;
    private final MasterDataService masterDataService;

    public MasterResource(InquiryTypeService inquiryTypeService, ClaimTypeService claimTypeService,
                          InquirySubTypeService inquirySubTypeService, ClaimSubTypeService claimSubTypeService, MasterDataService masterDataService) {
        this.inquiryTypeService = inquiryTypeService;
        this.claimTypeService = claimTypeService;
        this.inquirySubTypeService = inquirySubTypeService;
        this.claimSubTypeService = claimSubTypeService;
        this.masterDataService = masterDataService;
    }

    /**
     * Get a list of active inquiry types.
     *
     * @return List of active inquiry types.
     */
    @Operation(summary = "List Active Inquiry Types", description = "Fetches a list of all active inquiry types.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of active inquiry types",
            content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = DropdownListDTO.class)))
    })
    @GetMapping("/inquiry-type-list")
    public ResponseEntity<List<DropdownListDTO>> listActiveInquiryTypes() {
        List<DropdownListDTO> inquiryTypes = inquiryTypeService.listActiveInquiryTypes();
        return ResponseEntity.ok(inquiryTypes);
    }

    /**
     * Get a list of active inquiry subtypes by inquiry type ID.
     *
     * @param inquiryTypeId ID of the inquiry type.
     * @return List of active inquiry subtypes.
     */
    @Operation(summary = "List Active Inquiry Sub-Types", description = "Fetches a list of all active inquiry sub-types based on the inquiry type ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of active inquiry sub-types",
            content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = DropdownListDTO.class))),
        @ApiResponse(responseCode = "404", description = "Inquiry Type not found")
    })
    @GetMapping("/inquiry-sub-type-list/{inquiryTypeId}")
    public ResponseEntity<List<DropdownListDTO>> listActiveInquirySubTypesByInquiryType(@PathVariable Long inquiryTypeId) {
        List<DropdownListDTO> inquirySubTypes = inquirySubTypeService.listActiveSubInquiryTypesById(inquiryTypeId);
        return ResponseEntity.ok(inquirySubTypes);
    }

    /**
     * Get a list of active claim types.
     *
     * @return List of active claim types.
     */
    @Operation(summary = "List Active Claim Types", description = "Fetches a list of all active claim types.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of active claim types",
            content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = DropdownListDTO.class)))
    })
    @GetMapping("/claim-type-list")
    public ResponseEntity<List<DropdownListDTO>> listActiveClaimTypes() {
        List<DropdownListDTO> claimTypes = claimTypeService.listActiveClaimTypes();
        return ResponseEntity.ok(claimTypes);
    }

    /**
     * Get a list of active claim subtypes by claim type ID.
     *
     * @param claimTypeId ID of the claim type.
     * @return List of active claim subtypes.
     */
    @Operation(summary = "List Active Claim Sub-Types", description = "Fetches a list of all active claim sub-types based on the claim type ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of active claim sub-types",
            content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = DropdownListDTO.class))),
        @ApiResponse(responseCode = "404", description = "Claim Type not found")
    })
    @GetMapping("/claim-sub-type-list/{claimTypeId}")
    public ResponseEntity<List<DropdownListDTO>> listActiveClaimSubTypesByClaimType(@PathVariable Long claimTypeId) {
        List<DropdownListDTO> claimSubTypes = claimSubTypeService.listActiveClaimSubTypesById(claimTypeId);
        return ResponseEntity.ok(claimSubTypes);
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
