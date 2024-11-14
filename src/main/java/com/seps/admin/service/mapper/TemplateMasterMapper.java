package com.seps.admin.service.mapper;

import com.seps.admin.domain.TemplateMaster;
import com.seps.admin.enums.TemplateTypeEnum;
import com.seps.admin.service.dto.TemplateMasterDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.UUID;

@Mapper(componentModel = "spring", uses = {ProvinceMapper.class})
public interface TemplateMasterMapper {

    @Mapping(target = "templateKey", ignore = true)
    @Mapping(target = "content", ignore = true)
    @Mapping(target = "supportedVariables", ignore = true)
    TemplateMasterDTO toDTO(TemplateMaster entity);

    TemplateMaster toEntity(TemplateMasterDTO dto);

    default TemplateMaster mapToEntity(TemplateMasterDTO dto) {
        // Auto-generate templateKey if not provided
        if (dto.getTemplateKey() == null) {
            dto.setTemplateKey(generateTemplateKey(dto.getTemplateName()));
        }
        return TemplateMaster.builder()
            .templateKey(dto.getTemplateKey())
            .templateName(dto.getTemplateName())
            .templateType(dto.getTemplateType().name())
            .subject(dto.getSubject())
            .content(dto.getContent())
            .supportedVariables(dto.getSupportedVariables())
            .status(true)
            .build();
    }

    default TemplateMasterDTO mapToDTO(TemplateMaster entity) {
        return TemplateMasterDTO.builder()
            .id(entity.getId())
            .templateKey(entity.getTemplateKey())
            .templateName(entity.getTemplateName())
            .templateType(TemplateTypeEnum.valueOf(entity.getTemplateType()))
            .subject(entity.getSubject())
            .content(entity.getContent())
            .supportedVariables(entity.getSupportedVariables())
            .status(entity.getStatus())
            .build();
    }

    private String generateTemplateKey(String templateName) {
        // Slugify the template name
        String slug = templateName.toLowerCase()
            .replaceAll("([^a-z0-9\\s]+)", "")   // Remove special characters
            .replaceAll("(\\s+)", "_")           // Replace spaces with underscores
            .replaceAll("(_+)", "_")             // Remove consecutive underscores
            .replaceAll("(^_)|(_$)", "");        // Trim leading/trailing underscores


        // Generate a unique suffix (e.g., timestamp or random UUID substring)
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 6);

        // Combine slug and unique suffix for templateKey
        return slug + "_" + uniqueSuffix;
    }
}

