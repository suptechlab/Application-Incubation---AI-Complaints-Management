package com.seps.admin.service.mapper;

import com.seps.admin.domain.TemplateVariable;
import com.seps.admin.service.dto.TemplateVariableDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TemplateVariableMapper {
    TemplateVariableDTO toDTO(TemplateVariable templateVariable);

}

