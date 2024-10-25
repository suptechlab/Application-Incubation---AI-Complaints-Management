package com.seps.admin.service.mapper;

import com.seps.admin.domain.ProvinceEntity;
import com.seps.admin.service.dto.DropdownListDTO;
import com.seps.admin.service.dto.ProvinceDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProvinceMapper {

    ProvinceDTO toDTO(ProvinceEntity entity);

    ProvinceEntity toEntity(ProvinceDTO dto);

    DropdownListDTO toDropDownDTO(ProvinceEntity provinceEntity);
}

