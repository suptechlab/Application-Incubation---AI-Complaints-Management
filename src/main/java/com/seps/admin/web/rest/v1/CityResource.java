package com.seps.admin.web.rest.v1;

import com.seps.admin.service.CityService;
import com.seps.admin.service.dto.CityDTO;
import com.seps.admin.service.dto.RequestInfo;
import com.seps.admin.service.dto.ResponseStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
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

@Tag(name = "City Management", description = "APIs for managing city entities")
@RestController
@RequestMapping("/api/v1/cities")
public class CityResource {

    private final CityService cityService;
    private final MessageSource messageSource;

    public CityResource(CityService cityService, MessageSource messageSource) {
        this.cityService = cityService;
        this.messageSource = messageSource;
    }

    @Operation(summary = "Create a new City", description = "Add a new city with the specified details")
    @ApiResponse(responseCode = "201", description = "City created successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ResponseStatus.class)))
    @PostMapping
    public ResponseEntity<ResponseStatus> addCity(@RequestBody CityDTO cityDTO, HttpServletRequest request) throws URISyntaxException {
        RequestInfo requestInfo = new RequestInfo(request);
        Long id = cityService.addCity(cityDTO, requestInfo);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("city.created.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.CREATED.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.created(new URI("/api/v1/cities/" + id))
            .body(responseStatus);
    }

    @Operation(summary = "Update an existing City", description = "Update the details of an existing city")
    @ApiResponse(responseCode = "200", description = "City updated successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ResponseStatus.class)))
    @PutMapping("/{id}")
    public ResponseEntity<ResponseStatus> updateCity(@PathVariable Long id, @RequestBody CityDTO cityDTO, HttpServletRequest request) {
        RequestInfo requestInfo = new RequestInfo(request);
        cityService.updateCity(id, cityDTO, requestInfo);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("city.updated.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    @Operation(summary = "Get a City by ID", description = "Retrieve a city by its ID")
    @ApiResponse(responseCode = "200", description = "City retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = CityDTO.class)))
    @GetMapping("/{id}")
    public ResponseEntity<CityDTO> getCityById(@PathVariable Long id) {
        return ResponseEntity.ok(cityService.getCityById(id));
    }

    @Operation(summary = "List all Cities", description = "Retrieve a paginated list of all cities with optional search and status filters")
    @ApiResponse(responseCode = "200", description = "Cities retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = CityDTO.class)))
    @GetMapping
    public ResponseEntity<List<CityDTO>> listCities(Pageable pageable,
                                                    @RequestParam(value = "search", required = false) String search,
                                                    @Parameter(description = "Filter by status (true for active, false for inactive)") @RequestParam(required = false) Boolean status) {
        Page<CityDTO> page = cityService.listCities(pageable, search, status);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @Operation(summary = "Change the status of a City", description = "Update the status of a city to active or inactive")
    @ApiResponse(responseCode = "204", description = "Status changed successfully")
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> changeStatus(@PathVariable Long id, @RequestParam Boolean status, HttpServletRequest request) {
        RequestInfo requestInfo = new RequestInfo(request);
        cityService.changeStatus(id, status, requestInfo);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Download list of Cities", description = "Download a list of all cities as an Excel file with optional filters.")
    @ApiResponse(responseCode = "200", description = "File downloaded successfully",
        content = @Content(mediaType = "application/octet-stream"))
    @GetMapping("/download")
    public ResponseEntity<byte[]> listCitiesDownload(@RequestParam(required = false) String search,
                                                        @RequestParam(required = false) Boolean status) throws IOException {
        ByteArrayInputStream in = cityService.listCitiesDownload(search, status);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=cities.xlsx");
        try (in) {
            return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(in.readAllBytes());
        }
    }
}
