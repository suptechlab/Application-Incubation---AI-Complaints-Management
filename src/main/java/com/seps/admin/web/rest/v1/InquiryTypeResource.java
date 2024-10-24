package com.seps.admin.web.rest.v1;

import com.seps.admin.service.InquiryTypeService;
import com.seps.admin.service.dto.InquiryTypeDTO;
import com.seps.admin.service.dto.ResponseStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

@Tag(name = "Inquiry Types", description = "APIs for managing inquiry types")
@RestController
@RequestMapping("/api/v1/inquiry-types")
public class InquiryTypeResource {

    private final Logger log = LoggerFactory.getLogger(InquiryTypeResource.class);

    private final InquiryTypeService inquiryTypeService;
    private final MessageSource messageSource;

    public InquiryTypeResource(InquiryTypeService inquiryTypeService, MessageSource messageSource) {
        this.inquiryTypeService = inquiryTypeService;
        this.messageSource = messageSource;
    }

    @Operation(summary = "Create a new Inquiry Type", description = "Create a new inquiry type with the provided details")
    @ApiResponse(responseCode = "201", description = "Inquiry Type created successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ResponseStatus.class)))
    @PostMapping
    public ResponseEntity<ResponseStatus> createInquiryType(@Valid @RequestBody InquiryTypeDTO inquiryType) throws URISyntaxException {
        log.debug("create request with {}", inquiryType);
        Long id = inquiryTypeService.addInquiryType(inquiryType, LocaleContextHolder.getLocale());
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("inquiry.type.created.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.CREATED.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.created(new URI("/api/v1/inquiry-types/" + id))
            .body(responseStatus);
    }

    @Operation(summary = "Update an existing Inquiry Type", description = "Update an inquiry type with the provided ID and details")
    @ApiResponse(responseCode = "200", description = "Inquiry Type updated successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ResponseStatus.class)))
    @PutMapping("/{id}")
    public ResponseEntity<ResponseStatus> updateInquiryType(
        @Parameter(description = "ID of the inquiry type to update", required = true) @PathVariable Long id,
        @RequestBody InquiryTypeDTO inquiryType) {
        inquiryTypeService.updateInquiryType(id, inquiryType);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("inquiry.type.updated.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    @Operation(summary = "Get an Inquiry Type by ID", description = "Retrieve details of an inquiry type by its ID")
    @ApiResponse(responseCode = "200", description = "Inquiry Type retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = InquiryTypeDTO.class)))
    @GetMapping("/{id}")
    public ResponseEntity<InquiryTypeDTO> getInquiryType(
        @Parameter(description = "ID of the inquiry type to retrieve", required = true) @PathVariable Long id) {
        InquiryTypeDTO inquiryType = inquiryTypeService.getInquiryTypeById(id);
        return ResponseEntity.ok(inquiryType);
    }

    @Operation(summary = "Get all Inquiry Types", description = "Retrieve a paginated list of all inquiry types with optional search filter")
    @ApiResponse(responseCode = "200", description = "List of inquiry types retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = InquiryTypeDTO.class)))
    @GetMapping
    public ResponseEntity<List<InquiryTypeDTO>> getAllInquiryTypes(
        @PageableDefault Pageable pageable,
        @RequestParam(value = "search", required = false) String search) {
        log.debug("REST request to get all Inquiry Types with search filter: {}", search);
        Page<InquiryTypeDTO> page = inquiryTypeService.getAllInquiryTypes(pageable, search);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @Operation(summary = "Change the status of an Inquiry Type", description = "Update the status of an inquiry type to either active or inactive")
    @ApiResponse(responseCode = "204", description = "Inquiry Type status updated successfully")
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> changeInquiryTypeStatus(
        @Parameter(description = "ID of the inquiry type to update status", required = true) @PathVariable("id") Long inquiryTypeId,
        @Parameter(description = "New status of the inquiry type (true for active, false for inactive)", required = true) @RequestParam("status") Boolean status
    ) {
        inquiryTypeService.changeStatus(inquiryTypeId, status);
        return ResponseEntity.noContent().build();
    }
}
