package com.seps.user.service.mapper;

import com.seps.user.domain.ProvinceEntity;
import com.seps.user.service.dto.DropdownListDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProvinceMapper {

    DropdownListDTO toDropDownDTO(ProvinceEntity provinceEntity);
}

