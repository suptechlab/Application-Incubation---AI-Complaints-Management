package com.seps.ticket.service.mapper;

import com.seps.ticket.domain.ClaimSubType;
import com.seps.ticket.service.dto.ClaimSubTypeDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ClaimSubTypeMapper.class})
public interface ClaimSubTypeMapper {

    @Mapping(source = "claimType.name", target = "claimTypeName")
    ClaimSubTypeDTO toDTO(ClaimSubType entity);
}

