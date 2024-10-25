package com.seps.admin.service.mapper;

import com.seps.admin.domain.ClaimSubTypeEntity;
import com.seps.admin.service.dto.ClaimSubTypeDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ClaimTypeMapper.class})
public interface ClaimSubTypeMapper {

    @Mapping(source = "claimType.name", target = "claimTypeName")
    ClaimSubTypeDTO toDTO(ClaimSubTypeEntity entity);

    ClaimSubTypeEntity toEntity(ClaimSubTypeDTO dto);
}

