package com.seps.admin.service.mapper;

import com.seps.admin.domain.Role;
import com.seps.admin.service.dto.RoleDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring", uses = {})
public interface RoleMapper extends EntityMapper<RoleDTO, Role> {

    @Mappings({
        @Mapping(source = "createdBy", target = "createdBy"),
        @Mapping(source = "createdAt", target = "createdAt"),
        @Mapping(source = "updatedAt", target = "updatedAt")
    })
    RoleDTO toDto(Role role);

    @Mappings({
        @Mapping(source = "createdBy", target = "createdBy"),
        @Mapping(source = "createdAt", target = "createdAt"),
        @Mapping(source = "updatedAt", target = "updatedAt")
    })
    Role toEntity(RoleDTO roleDTO);

    default Role fromId(Long id) {
        if (id == null) {
            return null;
        }
        Role role = new Role();
        role.setId(id);
        return role;
    }
}
