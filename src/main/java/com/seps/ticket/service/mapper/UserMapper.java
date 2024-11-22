package com.seps.ticket.service.mapper;

import com.seps.ticket.domain.Authority;
import com.seps.ticket.domain.User;
import com.seps.ticket.service.dto.UserDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // Explicitly map authorities using the default method
    @Mapping(source = "authorities", target = "authorities")
    UserDTO toDto(User user);

    default Set<String> map(Set<Authority> authorities) {
        if (authorities == null) {
            return null; // Handle null case
        }
        return authorities.stream()
            .map(Authority::getName) // Ensure Authority has a getName() method
            .collect(Collectors.toSet());
    }
}
