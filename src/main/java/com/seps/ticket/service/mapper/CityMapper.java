package com.seps.ticket.service.mapper;

import com.seps.ticket.domain.City;
import com.seps.ticket.service.dto.CityDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ProvinceMapper.class})
public interface CityMapper {

    @Mapping(source = "province.name", target = "provinceName")
    CityDTO toDTO(City entity);
}

