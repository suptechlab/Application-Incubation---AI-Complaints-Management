package com.seps.admin.web.rest.v1;

import com.seps.admin.service.TemplateMasterService;
import com.seps.admin.service.dto.TemplateMasterDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/templates")
public class TemplateMasterResource {

    private final TemplateMasterService service;

    public TemplateMasterResource(TemplateMasterService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TemplateMasterDTO> createTemplate(@RequestBody TemplateMasterDTO dto) {
        return ResponseEntity.ok(service.createTemplate(dto));
    }

    @GetMapping("/{templateKey}")
    public ResponseEntity<TemplateMasterDTO> getTemplateByKey(@PathVariable String templateKey) {
        Optional<TemplateMasterDTO> template = service.findByTemplateKey(templateKey);
        return template.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
