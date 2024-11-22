package com.seps.user.service.mapper;

import com.seps.user.domain.Organization;
import com.seps.user.service.dto.OrganizationDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OrganizationMapper {
    OrganizationDTO toDTO(Organization entity);
}

