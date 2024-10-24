package com.seps.admin.web.rest.v1;

import com.seps.admin.service.ClaimTypeService;
import com.seps.admin.service.dto.ClaimTypeDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/claim-types")
public class ClaimTypeResource {

    private final ClaimTypeService claimTypeService;

    public ClaimTypeResource(ClaimTypeService claimTypeService) {
        this.claimTypeService = claimTypeService;
    }

    @PostMapping
    public ResponseEntity<Long> addClaimType(@RequestBody ClaimTypeDTO claimTypeDTO) throws URISyntaxException {
        Long id = claimTypeService.addClaimType(claimTypeDTO);
        return ResponseEntity.created(new URI("/api/v1/claim-types/" + id)).body(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateClaimType(@PathVariable Long id, @RequestBody ClaimTypeDTO claimTypeDTO) {
        claimTypeService.updateClaimType(id, claimTypeDTO);
        return ResponseEntity.ok().build();
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
}
