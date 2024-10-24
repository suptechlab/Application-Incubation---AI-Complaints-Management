package com.seps.admin.service.mapper;

import com.seps.admin.domain.ClaimTypeEntity;
import com.seps.admin.service.dto.ClaimTypeDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ClaimTypeMapper {

    ClaimTypeDTO toDTO(ClaimTypeEntity entity);

    ClaimTypeEntity toEntity(ClaimTypeDTO dto);
}

