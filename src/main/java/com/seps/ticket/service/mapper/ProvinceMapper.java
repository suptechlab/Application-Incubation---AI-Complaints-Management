package com.seps.ticket.service.mapper;

import com.seps.ticket.domain.Province;
import com.seps.ticket.service.dto.ProvinceDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProvinceMapper {

    ProvinceDTO toDTO(Province entity);

}

