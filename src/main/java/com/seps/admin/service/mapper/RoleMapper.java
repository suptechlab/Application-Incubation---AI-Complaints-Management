package com.seps.admin.service.mapper;

import com.seps.admin.domain.Role;
import com.seps.admin.service.dto.DropdownListDTO;
import com.seps.admin.service.dto.RoleDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {})
public interface RoleMapper extends EntityMapper<RoleDTO, Role> {

    RoleDTO toDto(Role role);

    Role toEntity(RoleDTO roleDTO);

    DropdownListDTO toDropDownDTO(Role role);

    default Role fromId(Long id) {
        if (id == null) {
            return null;
        }
        Role role = new Role();
        role.setId(id);
        return role;
    }
}
