package com.seps.admin.service.mapper;

import com.seps.admin.domain.CityEntity;
import com.seps.admin.domain.Organization;
import com.seps.admin.service.dto.CityDTO;
import com.seps.admin.service.dto.OrganizationDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrganizationMapper {

    OrganizationDTO toDTO(Organization entity);

    Organization toEntity(OrganizationDTO dto);
}

