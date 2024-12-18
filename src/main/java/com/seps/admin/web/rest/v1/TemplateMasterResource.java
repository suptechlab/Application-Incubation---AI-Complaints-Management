package com.seps.admin.web.rest.v1;

import com.seps.admin.aop.permission.PermissionCheck;
import com.seps.admin.enums.EmailUserTypeEnum;
import com.seps.admin.enums.TemplateTypeEnum;
import com.seps.admin.service.TemplateMasterService;
import com.seps.admin.service.dto.DropdownListDTO;
import com.seps.admin.service.dto.RequestInfo;
import com.seps.admin.service.dto.ResponseStatus;
import com.seps.admin.service.dto.TemplateMasterDTO;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/templates")
@Tag(name = "Template Master", description = "APIs for managing template master records")
public class TemplateMasterResource {

    private final TemplateMasterService service;
    private final MessageSource messageSource;

    public TemplateMasterResource(TemplateMasterService service, MessageSource messageSource) {
        this.service = service;
        this.messageSource = messageSource;
    }

    @Operation(summary = "Create a new template", description = "Creates a new template and returns its ID")
    @ApiResponse(responseCode = "201", description = "Template created successfully", content = @Content(schema = @Schema(implementation = ResponseStatus.class)))
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    @PostMapping
    @PermissionCheck({"TEMPLATE_CREATE","TEMPLATE_CREATE_FI"})
    public ResponseEntity<ResponseStatus> createTemplate(@Valid @RequestBody TemplateMasterDTO dto, HttpServletRequest request) throws URISyntaxException {
        RequestInfo requestInfo = new RequestInfo(request);
        Long id = service.createTemplate(dto, requestInfo);
        ResponseStatus responseStatus = new ResponseStatus(
                messageSource.getMessage("template.created.successfully", null, LocaleContextHolder.getLocale()),
                HttpStatus.CREATED.value(),
                System.currentTimeMillis()
        );
        return ResponseEntity.created(new URI("/api/v1/templates/" + id))
                .body(responseStatus);
    }

    @Operation(summary = "Update an existing template", description = "Updates the details of an existing template by its ID")
    @ApiResponse(responseCode = "200", description = "Template updated successfully", content = @Content(schema = @Schema(implementation = ResponseStatus.class)))
    @ApiResponse(responseCode = "404", description = "Template not found")
    @PutMapping("/{id}")
    @PermissionCheck({"TEMPLATE_UPDATE","TEMPLATE_UPDATE_FI"})
    public ResponseEntity<ResponseStatus> updateTemplate(@PathVariable Long id, @Valid @RequestBody TemplateMasterDTO dto, HttpServletRequest request) {
        RequestInfo requestInfo = new RequestInfo(request);
        service.updateTemplate(id, dto, requestInfo);
        ResponseStatus responseStatus = new ResponseStatus(
                messageSource.getMessage("template.updated.successfully", null, LocaleContextHolder.getLocale()),
                HttpStatus.OK.value(),
                System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    @Operation(summary = "Get template by ID", description = "Fetches the details of a template by its ID")
    @ApiResponse(responseCode = "200", description = "Template found", content = @Content(schema = @Schema(implementation = TemplateMasterDTO.class)))
    @ApiResponse(responseCode = "404", description = "Template not found")
    @GetMapping("/{id}")
    @PermissionCheck({"TEMPLATE_UPDATE","TEMPLATE_UPDATE_FI"})
    public ResponseEntity<TemplateMasterDTO> getTemplateById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getTemplateById(id));
    }

    @Operation(summary = "Get template by template key", description = "Fetches the details of a template by its unique key")
    @ApiResponse(responseCode = "200", description = "Template found", content = @Content(schema = @Schema(implementation = TemplateMasterDTO.class)))
    @ApiResponse(responseCode = "404", description = "Template not found")
    @GetMapping("/templateKey/{templateKey}")
    @PermissionCheck({"TEMPLATE_UPDATE","TEMPLATE_UPDATE_FI"})
    public ResponseEntity<TemplateMasterDTO> getTemplateByKey(@PathVariable String templateKey) {
        Optional<TemplateMasterDTO> template = service.findByTemplateKey(templateKey);
        return template.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "List all templates", description = "Fetches a paginated list of templates with optional filters")
    @ApiResponse(responseCode = "200", description = "List of templates", content = @Content(schema = @Schema(implementation = TemplateMasterDTO.class)))
    @GetMapping
    @PermissionCheck({"TEMPLATE_CREATE","TEMPLATE_UPDATE","TEMPLATE_STATUS_CHANGE","TEMPLATE_CREATE_FI","TEMPLATE_UPDATE_FI","TEMPLATE_STATUS_CHANGE_FI"})
    public ResponseEntity<List<TemplateMasterDTO>> listTemplates(Pageable pageable,
                                                                 @RequestParam(value = "search", required = false) String search,
                                                                 @Parameter(description = "Filter by status (true for active, false for inactive)") @RequestParam(required = false) Boolean status,
                                                                 @Parameter(description = "Filter by templateType (EMAIL, NOTIFICATION)") @RequestParam(required = false) TemplateTypeEnum templateType) {
        Page<TemplateMasterDTO> page = service.listTemplates(pageable, search, status, templateType);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @Operation(summary = "Change the status of a template", description = "Updates the status (active/inactive) of a template by its ID")
    @ApiResponse(responseCode = "204", description = "Status changed successfully")
    @ApiResponse(responseCode = "404", description = "Template not found")
    @PatchMapping("/{id}/status")
    @PermissionCheck({"TEMPLATE_STATUS_CHANGE"})
    public ResponseEntity<Void> changeStatus(@PathVariable Long id, @RequestParam Boolean status, HttpServletRequest request) {
        RequestInfo requestInfo = new RequestInfo(request);
        service.changeStatus(id, status, requestInfo);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Download templates as Excel file", description = "Generates and returns an Excel file containing a list of templates filtered by the provided search, status, and template type.")
    @ApiResponse(responseCode = "200", description = "Excel file generated successfully", content = @Content(mediaType = "application/octet-stream"))
    @ApiResponse(responseCode = "500", description = "Internal server error")
    @GetMapping("/download")
    @PermissionCheck({"TEMPLATE_CREATE","TEMPLATE_UPDATE","TEMPLATE_STATUS_CHANGE","TEMPLATE_CREATE_FI","TEMPLATE_UPDATE_FI","TEMPLATE_STATUS_CHANGE_FI"})
    public ResponseEntity<byte[]> listTemplatesDownload(@RequestParam(value = "search", required = false) String search,
                                                        @Parameter(description = "Filter by status (true for active, false for inactive)") @RequestParam(required = false) Boolean status,
                                                        @Parameter(description = "Filter by templateType (EMAIL, NOTIFICATION)") @RequestParam(required = false) TemplateTypeEnum templateType) throws IOException {
        ByteArrayInputStream in = service.listTemplatesDownloadExcel(search, status, templateType);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=templates.xlsx");

        try (in) {
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(in.readAllBytes());
        }
    }

    @GetMapping("/dropdown-list")
    public ResponseEntity<List<DropdownListDTO>> listActiveTemplatesForCopy() {
        List<DropdownListDTO> templatesList = service.listActiveTemplatesForCopy();
        return ResponseEntity.ok(templatesList);
    }

    @GetMapping("/{id}/for-copy")
    public ResponseEntity<TemplateMasterDTO> getTemplateByIdForCopy(@PathVariable Long id) {
        return ResponseEntity.ok(service.getTemplateByIdForCopy(id));
    }

    @GetMapping("/dropdown-list-for-workflow")
    public ResponseEntity<List<DropdownListDTO>> listActiveTemplatesForWorkflow(@RequestParam(required = false) EmailUserTypeEnum userType,
                                                                                @RequestParam(required = false) Long organizationId) {
        List<DropdownListDTO> templatesList = service.listActiveTemplatesForWorkFlow(userType, organizationId);
        return ResponseEntity.ok(templatesList);
    }
}
