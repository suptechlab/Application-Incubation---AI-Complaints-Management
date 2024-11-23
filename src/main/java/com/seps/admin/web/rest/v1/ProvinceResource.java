package com.seps.admin.web.rest.v1;

import com.seps.admin.aop.permission.PermissionCheck;
import com.seps.admin.service.ProvinceService;
import com.seps.admin.service.dto.DropdownListDTO;
import com.seps.admin.service.dto.ProvinceDTO;
import com.seps.admin.service.dto.RequestInfo;
import com.seps.admin.service.dto.ResponseStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
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

@Tag(name = "Province Management", description = "APIs for managing provinces")
@RestController
@RequestMapping("/api/v1/provinces")
public class ProvinceResource {

    private final ProvinceService provinceService;
    private final MessageSource messageSource;

    public ProvinceResource(ProvinceService provinceService, MessageSource messageSource) {
        this.provinceService = provinceService;
        this.messageSource = messageSource;
    }

    @Operation(summary = "Create a new Province", description = "Add a new province with details.")
    @ApiResponse(responseCode = "201", description = "Province created successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ResponseStatus.class)))
    @PostMapping
    @PermissionCheck({"PROVINCE_CREATE"})
    public ResponseEntity<ResponseStatus> addProvince(@Valid @RequestBody ProvinceDTO provinceDTO, HttpServletRequest request) throws URISyntaxException {
        RequestInfo requestInfo = new RequestInfo(request);
        Long id = provinceService.addProvince(provinceDTO, requestInfo);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("province.created.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.CREATED.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.created(new URI("/api/v1/provinces/" + id))
            .body(responseStatus);
    }

    @Operation(summary = "Update an existing Province", description = "Update the details of an existing province.")
    @ApiResponse(responseCode = "200", description = "Province updated successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ResponseStatus.class)))
    @PutMapping("/{id}")
    @PermissionCheck({"PROVINCE_UPDATE"})
    public ResponseEntity<ResponseStatus> updateProvince(@PathVariable Long id, @Valid @RequestBody ProvinceDTO provinceDTO, HttpServletRequest request) {
        RequestInfo requestInfo = new RequestInfo(request);
        provinceService.updateProvince(id, provinceDTO, requestInfo);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("province.updated.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    @Operation(summary = "Get a Province by ID", description = "Retrieve a specific province by its ID.")
    @ApiResponse(responseCode = "200", description = "Province details retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ProvinceDTO.class)))
    @GetMapping("/{id}")
    @PermissionCheck({"PROVINCE_UPDATE"})
    public ResponseEntity<ProvinceDTO> getProvinceById(@PathVariable Long id) {
        return ResponseEntity.ok(provinceService.getProvinceById(id));
    }

    @Operation(summary = "List all Provinces", description = "Retrieve a list of all provinces with optional search and status filters.")
    @ApiResponse(responseCode = "200", description = "Provinces retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ProvinceDTO.class)))
    @GetMapping
    @PermissionCheck({"PROVINCE_CREATE","PROVINCE_UPDATE","PROVINCE_STATUS_CHANGE"})
    public ResponseEntity<List<ProvinceDTO>> listProvinces(Pageable pageable,
                                                           @RequestParam(value = "search", required = false) String search,
                                                           @Parameter(description = "Filter by status (true for active, false for inactive)") @RequestParam(required = false) Boolean status) {
        Page<ProvinceDTO> page = provinceService.listProvinces(pageable, search, status);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @Operation(summary = "Change the status of a Province", description = "Update the status of a province (active/inactive).")
    @ApiResponse(responseCode = "204", description = "Status changed successfully")
    @PatchMapping("/{id}/status")
    @PermissionCheck({"PROVINCE_STATUS_CHANGE"})
    public ResponseEntity<Void> changeStatus(@PathVariable Long id, @RequestParam Boolean status, HttpServletRequest request) {
        RequestInfo requestInfo = new RequestInfo(request);
        provinceService.changeStatus(id, status, requestInfo);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Download list of Provinces", description = "Download a list of all provinces as an Excel file with optional filters.")
    @ApiResponse(responseCode = "200", description = "File downloaded successfully",
        content = @Content(mediaType = "application/octet-stream"))
    @GetMapping("/download")
    @PermissionCheck({"PROVINCE_CREATE","PROVINCE_UPDATE","PROVINCE_STATUS_CHANGE"})
    public ResponseEntity<byte[]> listProvincesDownload(@RequestParam(required = false) String search,
                                                        @RequestParam(required = false) Boolean status) throws IOException {
        ByteArrayInputStream in = provinceService.listProvincesDownload(search, status);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=provinces.xlsx");

        try (in) {
            return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(in.readAllBytes());
        }
    }

    @Operation(summary = "Get active Provinces for dropdown", description = "Retrieve a list of active provinces for dropdown selection.")
    @ApiResponse(responseCode = "200", description = "Active provinces retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = DropdownListDTO.class)))
    @GetMapping("/dropdown-list")
    public ResponseEntity<List<DropdownListDTO>> listActiveInquiryTypes() {
        List<DropdownListDTO> province = provinceService.listActiveProvince();
        return ResponseEntity.ok(province);
    }
}
