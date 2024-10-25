package com.seps.admin.service.mapper;

import com.seps.admin.domain.ClaimTypeEntity;
import com.seps.admin.service.dto.ClaimTypeDTO;
import com.seps.admin.service.dto.DropdownListDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ClaimTypeMapper {

    ClaimTypeDTO toDTO(ClaimTypeEntity entity);

    ClaimTypeEntity toEntity(ClaimTypeDTO dto);

    DropdownListDTO toDropDownDTO(ClaimTypeEntity claimTypeEntity);
}

