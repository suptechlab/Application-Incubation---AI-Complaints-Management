package com.seps.admin.service.mapper;

import com.seps.admin.domain.Authority;
import com.seps.admin.domain.Role;
import com.seps.admin.domain.User;
import com.seps.admin.service.dto.FIUserDTO;
import com.seps.admin.service.dto.SEPSUserDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(source = "authorities", target = "authorities")
    // Map firstName to name
    @Mapping(source = "firstName", target = "name")
    SEPSUserDTO userToSEPSUserDTO(User user);

    @Mapping(source = "authorities", target = "authorities")
    @Mapping(source = "firstName", target = "name")
    @Mapping(source = "organization.ruc", target = "ruc")
    @Mapping(target = "roleId", expression = "java(getFirstRoleId(user))")
        // Custom mapping for roleId
    FIUserDTO userToFIUserDTO(User user);

    default Set<String> map(Set<Authority> authorities) {
        return authorities.stream()
            .map(Authority::getName) // Assuming Authority has a getName() method
            .collect(Collectors.toSet());
    }

    // Helper method to get the ID of the first role from the user's roles
    default Long getFirstRoleId(User user) {
        return user.getRoles().stream()
            .findFirst() // Get the first role in the set
            .map(Role::getId) // Assuming Role has an getId() method
            .orElse(null); // Return null if no roles are present
    }
}
