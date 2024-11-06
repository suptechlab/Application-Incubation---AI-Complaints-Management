package com.seps.admin.service.mapper;

import com.seps.admin.domain.Authority;
import com.seps.admin.domain.User;
import com.seps.admin.service.dto.SEPSUserDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(source = "authorities", target = "authorities")
    @Mapping(source = "firstName", target = "name")  // Map firstName to name
    SEPSUserDTO userToSEPSUserDTO(User user);

    default Set<String> map(Set<Authority> authorities) {
        return authorities.stream()
            .map(Authority::getName) // Assuming Authority has a getName() method
            .collect(Collectors.toSet());
    }
}
