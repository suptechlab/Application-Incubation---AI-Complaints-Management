package com.seps.ticket.service.mapper;

import com.seps.ticket.domain.ClaimType;
import com.seps.ticket.service.dto.ClaimTypeDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ClaimTypeMapper {
    ClaimTypeDTO toDTO(ClaimType entity);
}

