package com.seps.admin.service.mapper;

import com.seps.admin.domain.Permission;
import com.seps.admin.service.dto.PermissionDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {

    PermissionDTO toDto(Permission permission);
}
