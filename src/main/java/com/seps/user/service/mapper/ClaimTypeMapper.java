package com.seps.user.service.mapper;

import com.seps.user.domain.ClaimTypeEntity;
import com.seps.user.service.dto.DropdownListDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ClaimTypeMapper {

    DropdownListDTO toDropDownDTO(ClaimTypeEntity claimTypeEntity);
}

