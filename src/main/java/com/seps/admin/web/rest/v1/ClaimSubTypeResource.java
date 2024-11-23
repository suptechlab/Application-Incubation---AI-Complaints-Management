package com.seps.admin.web.rest.v1;

import com.seps.admin.aop.permission.PermissionCheck;
import com.seps.admin.service.ClaimSubTypeService;
import com.seps.admin.service.dto.ClaimSubTypeDTO;
import com.seps.admin.service.dto.RequestInfo;
import com.seps.admin.service.dto.ResponseStatus;
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

@RestController
@RequestMapping("/api/v1/claim-sub-types")
public class ClaimSubTypeResource {

    private final ClaimSubTypeService claimSubTypeService;
    private final MessageSource messageSource;

    public ClaimSubTypeResource(ClaimSubTypeService claimSubTypeService, MessageSource messageSource) {
        this.claimSubTypeService = claimSubTypeService;
        this.messageSource = messageSource;
    }

    @PostMapping
    @PermissionCheck({"CLAIM_SUB_TYPE_CREATE"})
    public ResponseEntity<ResponseStatus> addClaimSubType(@RequestBody ClaimSubTypeDTO claimSubTypeDTO, HttpServletRequest request) throws URISyntaxException {
        RequestInfo requestInfo = new RequestInfo(request);
        Long id = claimSubTypeService.addClaimSubType(claimSubTypeDTO, requestInfo);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("claim.sub.type.created.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.CREATED.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.created(new URI("/api/v1/claim-sub-types/" + id))
            .body(responseStatus);
    }

    @PutMapping("/{id}")
    @PermissionCheck({"CLAIM_SUB_TYPE_UPDATE"})
    public ResponseEntity<ResponseStatus> updateClaimSubType(@PathVariable Long id, @RequestBody ClaimSubTypeDTO claimSubTypeDTO, HttpServletRequest request) {
        RequestInfo requestInfo = new RequestInfo(request);
        claimSubTypeService.updateClaimSubType(id, claimSubTypeDTO, requestInfo);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("claim.sub.type.updated.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    @GetMapping("/{id}")
    @PermissionCheck({"CLAIM_SUB_TYPE_UPDATE"})
    public ResponseEntity<ClaimSubTypeDTO> getClaimSubTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(claimSubTypeService.getClaimSubTypeById(id));
    }

    @GetMapping
    @PermissionCheck({"CLAIM_SUB_TYPE_CREATE","CLAIM_SUB_TYPE_UPDATE","CLAIM_SUB_TYPE_STATUS_CHANGE"})
    public ResponseEntity<List<ClaimSubTypeDTO>> listClaimSubTypes(Pageable pageable, @RequestParam(required = false) String search, @RequestParam(required = false) Boolean status) {
        Page<ClaimSubTypeDTO> page = claimSubTypeService.listClaimSubTypes(pageable, search, status);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @PatchMapping("/{id}/status")
    @PermissionCheck({"CLAIM_SUB_TYPE_STATUS_CHANGE"})
    public ResponseEntity<Void> changeStatus(@PathVariable Long id, @RequestParam Boolean status, HttpServletRequest request) {
        RequestInfo requestInfo = new RequestInfo(request);
        claimSubTypeService.changeStatus(id, status, requestInfo);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/download")
    @PermissionCheck({"CLAIM_SUB_TYPE_CREATE","CLAIM_SUB_TYPE_UPDATE","CLAIM_SUB_TYPE_STATUS_CHANGE"})
    public ResponseEntity<byte[]> listClaimSubTypesDownload(@RequestParam(required = false) String search, @RequestParam(required = false) Boolean status) throws IOException {
        ByteArrayInputStream in = claimSubTypeService.listClaimSubTypesDownload(search, status);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=claim-sub-types.xlsx");

        try(in) {
            return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(in.readAllBytes());
        }
    }
}

