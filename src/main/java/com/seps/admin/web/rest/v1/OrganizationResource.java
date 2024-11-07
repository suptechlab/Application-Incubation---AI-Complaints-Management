package com.seps.admin.web.rest.v1;

import com.seps.admin.service.OrganizationService;
import com.seps.admin.service.dto.RequestInfo;
import com.seps.admin.suptech.service.dto.OrganizationInfoDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Organization Management", description = "APIs for managing Organizations")
@RestController
@RequestMapping("/api/v1/organization")
public class OrganizationResource {

    private static final Logger LOG = LoggerFactory.getLogger(OrganizationResource.class);
    private final OrganizationService organizationService;
    private final MessageSource messageSource;

    public OrganizationResource(OrganizationService organizationService, MessageSource messageSource) {
        this.organizationService = organizationService;
        this.messageSource = messageSource;
    }

    @Operation(summary = "GET the organization information", description = "GET the organization information using ruc.")
    @ApiResponse(responseCode = "200", description = "Organization fetched successfully")
    @GetMapping("/info")
    public ResponseEntity<OrganizationInfoDTO> getOrganizationInfoInfoByRUC(@RequestParam(name = "ruc") String ruc, HttpServletRequest request) {
        RequestInfo requestInfo = new RequestInfo(request);
        // Perform the status update
        OrganizationInfoDTO organizationInfoDTO = organizationService.fetchOrganizationDetails(ruc, requestInfo);
        return ResponseEntity.ok(organizationInfoDTO);
    }
}
