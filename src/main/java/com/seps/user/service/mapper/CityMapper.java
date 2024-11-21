package com.seps.user.service.mapper;

import com.seps.user.domain.CityEntity;
import com.seps.user.service.dto.DropdownListDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ProvinceMapper.class})
public interface CityMapper {

    DropdownListDTO toDropDownDTO(CityEntity cityEntity);
}

