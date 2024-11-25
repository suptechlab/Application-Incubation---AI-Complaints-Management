package com.seps.auth.service.mapper;

import com.seps.auth.domain.Permission;
import com.seps.auth.service.dto.PermissionDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {

    PermissionDTO toDto(Permission permission);
}
