package com.seps.user.web.rest.v1;

import com.seps.user.service.*;
import com.seps.user.service.dto.DropdownListDTO;
import com.seps.user.service.dto.OrganizationDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;

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
    private final ProvinceService provinceService;
    private final CityService cityService;
    private final OrganizationService organizationService;

    public MasterResource(InquiryTypeService inquiryTypeService, ClaimTypeService claimTypeService,
                          InquirySubTypeService inquirySubTypeService, ClaimSubTypeService claimSubTypeService, MasterDataService masterDataService,
                          ProvinceService provinceService, CityService cityService, OrganizationService organizationService) {
        this.inquiryTypeService = inquiryTypeService;
        this.claimTypeService = claimTypeService;
        this.inquirySubTypeService = inquirySubTypeService;
        this.claimSubTypeService = claimSubTypeService;
        this.masterDataService = masterDataService;
        this.provinceService = provinceService;
        this.cityService =  cityService;
        this.organizationService = organizationService;
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

    @Operation(
        summary = "Get list of active provinces",
        description = "Fetches a list of all active provinces to populate dropdowns or other UI components.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "List of active provinces retrieved successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = DropdownListDTO.class)
                )
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error occurred",
                content = @Content
            )
        }
    )
    @GetMapping("/province-list")
    public ResponseEntity<List<DropdownListDTO>> listActiveProvince() {
        List<DropdownListDTO> province = provinceService.listActiveProvince();
        return ResponseEntity.ok(province);
    }

    @Operation(
        summary = "Get list of active cities by province",
        description = "Fetches a list of all active cities belonging to a specified province for dropdowns or other UI components.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "List of active cities retrieved successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = DropdownListDTO.class)
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid province ID provided",
                content = @Content
            ),
            @ApiResponse(
                responseCode = "404",
                description = "Province not found or no cities available",
                content = @Content
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error occurred",
                content = @Content
            )
        }
    )
    @GetMapping("/city-list/{provinceId}")
    public ResponseEntity<List<DropdownListDTO>> listActiveCityByProvince(@PathVariable Long provinceId) {
        List<DropdownListDTO> cities = cityService.listActiveCityByProvinceId(provinceId);
        return ResponseEntity.ok(cities);
    }

    @Operation(summary = "GET the organization list", description = "GET the organization list.")
    @ApiResponse(responseCode = "200", description = "Organization list fetched successfully")
    @GetMapping("/organization-list")
    public ResponseEntity<List<OrganizationDTO>> getOrganizationInfoInfoList(Pageable pageable,
                                                                             @RequestParam(value = "search", required = false) String search) {
        if ((search == null || search.isEmpty()) && !StringUtils.hasText(search)) {
            List<OrganizationDTO> orgList = organizationService.fetchOrganizationList();
            return ResponseEntity.ok().body(orgList);
        }else {
            Page<OrganizationDTO> orgList = organizationService.fetchOrganizationList(search, pageable);
            HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), orgList);
            return ResponseEntity.ok().headers(headers).body(orgList.getContent());
        }
    }
}
