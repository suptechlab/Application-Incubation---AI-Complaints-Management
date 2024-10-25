package com.seps.admin.web.rest.v1;

import com.seps.admin.service.ClaimTypeService;
import com.seps.admin.service.dto.ClaimTypeDTO;
import com.seps.admin.service.dto.DropdownListDTO;
import com.seps.admin.service.dto.ResponseStatus;
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
@RequestMapping("/api/v1/claim-types")
public class ClaimTypeResource {

    private final ClaimTypeService claimTypeService;
    private final MessageSource messageSource;

    public ClaimTypeResource(ClaimTypeService claimTypeService, MessageSource messageSource) {
        this.claimTypeService = claimTypeService;
        this.messageSource = messageSource;
    }

    @PostMapping
    public ResponseEntity<ResponseStatus> addClaimType(@RequestBody ClaimTypeDTO claimTypeDTO) throws URISyntaxException {
        Long id = claimTypeService.addClaimType(claimTypeDTO);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("claim.type.created.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.CREATED.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.created(new URI("/api/v1/claim-types/" + id))
            .body(responseStatus);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseStatus> updateClaimType(@PathVariable Long id, @RequestBody ClaimTypeDTO claimTypeDTO) {
        claimTypeService.updateClaimType(id, claimTypeDTO);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("claim.type.updated.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClaimTypeDTO> getClaimTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(claimTypeService.getClaimTypeById(id));
    }

    @GetMapping
    public ResponseEntity<List<ClaimTypeDTO>> listClaimTypes(Pageable pageable, @RequestParam(required = false) String search, @RequestParam(required = false) Boolean status) {
        Page<ClaimTypeDTO> page = claimTypeService.listClaimTypes(pageable, search, status);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> changeStatus(@PathVariable Long id, @RequestParam Boolean status) {
        claimTypeService.changeStatus(id, status);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/download")
    public ResponseEntity<byte[]> listClaimTypesDownload(@RequestParam(required = false) String search, @RequestParam(required = false) Boolean status) throws IOException {
        ByteArrayInputStream in = claimTypeService.listClaimTypesDownload(search, status);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=claim-types.xlsx");

        return ResponseEntity.ok()
            .headers(headers)
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(in.readAllBytes());
    }

    @GetMapping("/dropdown-list")
    public ResponseEntity<List<DropdownListDTO>> listActiveInquiryTypes() {
        List<DropdownListDTO> claimTypes = claimTypeService.listActiveInquiryTypes();
        return ResponseEntity.ok(claimTypes);
    }
}
