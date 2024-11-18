package com.seps.user.service.mapper;

import com.seps.user.domain.ClaimSubTypeEntity;
import com.seps.user.service.dto.DropdownListDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ClaimTypeMapper.class})
public interface ClaimSubTypeMapper {

    DropdownListDTO toDropDownDTO(ClaimSubTypeEntity claimSubTypeEntity);
}

