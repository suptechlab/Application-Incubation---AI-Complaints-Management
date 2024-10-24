package com.seps.admin.web.rest.v1;

import com.seps.admin.service.InquirySubTypeService;
import com.seps.admin.service.dto.DropdownListDTO;
import com.seps.admin.service.dto.InquirySubTypeDTO;
import com.seps.admin.service.dto.InquiryTypeDTO;
import com.seps.admin.service.dto.ResponseStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inquiry-sub-types")
public class InquirySubTypeResource {

    private final InquirySubTypeService service;
    private final MessageSource messageSource;

    public InquirySubTypeResource(InquirySubTypeService service, MessageSource messageSource) {
        this.service = service;
        this.messageSource = messageSource;
    }

    @Operation(summary = "Create a new Inquiry Sub-Type", description = "Adds a new inquiry sub-type to the system.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Inquiry Sub-Type created successfully", content = @Content(schema = @Schema(implementation = ResponseStatus.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data", content = @Content)
    })
    @PostMapping
    public ResponseEntity<ResponseStatus> addInquirySubType(@Valid @RequestBody InquirySubTypeDTO dto) throws URISyntaxException {
        Long id = service.addInquirySubType(dto);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("inquiry.sub.type.created.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.CREATED.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.created(new URI("/api/v1/inquiry-types/" + id))
            .body(responseStatus);
    }

    @Operation(summary = "Update an existing Inquiry Sub-Type", description = "Updates the details of an existing inquiry sub-type.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Inquiry Sub-Type updated successfully", content = @Content(schema = @Schema(implementation = ResponseStatus.class))),
        @ApiResponse(responseCode = "404", description = "Inquiry Sub-Type not found", content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<ResponseStatus> updateInquirySubType(
        @Parameter(description = "ID of the inquiry sub-type to update", required = true) @PathVariable Long id,
        @Valid @RequestBody InquirySubTypeDTO dto) {
        service.updateInquirySubType(id, dto);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("inquiry.sub.type.updated.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    @Operation(summary = "Get an Inquiry Sub-Type by ID", description = "Retrieves the details of a specific inquiry sub-type by its ID.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Inquiry Sub-Type found", content = @Content(schema = @Schema(implementation = InquirySubTypeDTO.class))),
        @ApiResponse(responseCode = "404", description = "Inquiry Sub-Type not found", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<InquirySubTypeDTO> getInquiryType(
        @Parameter(description = "ID of the inquiry sub-type to retrieve", required = true) @PathVariable Long id) {
        InquirySubTypeDTO inquiryType = service.getInquirySubTypeById(id);
        return ResponseEntity.ok(inquiryType);
    }

    @Operation(summary = "List Inquiry Sub-Types with filters", description = "Lists all inquiry sub-types with optional filters for search (by name or description) and status (active/inactive).")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "List of Inquiry Sub-Types", content = @Content(schema = @Schema(implementation = InquirySubTypeDTO.class))),
        @ApiResponse(responseCode = "400", description = "Invalid filters", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<InquirySubTypeDTO>> listInquirySubTypes(
        @Parameter(description = "Pagination information") Pageable pageable,
        @Parameter(description = "Search term to filter by name or description") @RequestParam(required = false) String search,
        @Parameter(description = "Status filter (true for active, false for inactive)") @RequestParam(required = false) Boolean status) {
        Page<InquirySubTypeDTO> page = service.listInquirySubTypes(pageable, search, status);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @Operation(summary = "Change Inquiry Sub-Type Status", description = "Change the status (active/inactive) of an inquiry sub-type.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Status changed successfully"),
        @ApiResponse(responseCode = "404", description = "Inquiry Sub-Type not found", content = @Content)
    })
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> changeStatus(
        @Parameter(description = "ID of the inquiry sub-type", required = true) @PathVariable Long id,
        @Parameter(description = "New status of the inquiry sub-type", required = true) @RequestParam Boolean status) {
        service.changeStatus(id, status);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "List Active Inquiry Types", description = "Returns a list of active inquiry types for dropdown selection.")
    @ApiResponse(responseCode = "200", description = "List of active inquiry types", content = @Content(schema = @Schema(implementation = InquiryTypeDTO.class)))
    @GetMapping("/inquiry-types")
    public ResponseEntity<List<DropdownListDTO>> listActiveInquiryTypes() {
        List<DropdownListDTO> inquiryTypes = service.listActiveInquiryTypes();
        return ResponseEntity.ok(inquiryTypes);
    }
}
