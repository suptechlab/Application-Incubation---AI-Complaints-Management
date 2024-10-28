package com.seps.admin.service.mapper;

import com.seps.admin.domain.CityEntity;
import com.seps.admin.service.dto.CityDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ProvinceMapper.class})
public interface CityMapper {

    @Mapping(source = "province.name", target = "provinceName")
    CityDTO toDTO(CityEntity entity);

    CityEntity toEntity(CityDTO dto);
}

