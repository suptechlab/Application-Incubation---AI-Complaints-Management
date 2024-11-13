package com.seps.admin.service;

import com.seps.admin.domain.TemplateMaster;
import com.seps.admin.repository.TemplateMasterRepository;
import com.seps.admin.service.dto.TemplateMasterDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class TemplateMasterService {

    private final TemplateMasterRepository repository;

    public TemplateMasterService(TemplateMasterRepository repository) {
        this.repository = repository;
    }

    public TemplateMasterDTO createTemplate(TemplateMasterDTO dto) {
        if (repository.existsByTemplateNameIgnoreCase(dto.getTemplateName())) {
            throw new IllegalArgumentException("Template name already exists");
        }

        TemplateMaster template = mapToEntity(dto);
        return mapToDTO(repository.save(template));
    }

    public Optional<TemplateMasterDTO> findByTemplateKey(String templateKey) {
        return repository.findByTemplateKeyIgnoreCase(templateKey).map(this::mapToDTO);
    }

    private TemplateMaster mapToEntity(TemplateMasterDTO dto) {
        return TemplateMaster.builder()
            //.templateKey(dto.getTemplateKey())
            .templateName(dto.getTemplateName())
            .templateType(dto.getTemplateType())
            .subject(dto.getSubject())
            .content(dto.getContent())
            .supportedVariables(dto.getSupportedVariables())
            .status(dto.getStatus())
            .build();
    }

    private TemplateMasterDTO mapToDTO(TemplateMaster entity) {
        return TemplateMasterDTO.builder()
            .id(entity.getId())
            .templateKey(entity.getTemplateKey())
            .templateName(entity.getTemplateName())
            .templateType(entity.getTemplateType())
            .subject(entity.getSubject())
            .content(entity.getContent())
            .supportedVariables(entity.getSupportedVariables())
            .status(entity.getStatus())
            .build();
    }
}
