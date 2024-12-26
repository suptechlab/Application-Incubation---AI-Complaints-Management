package com.seps.ticket.service;

import com.seps.ticket.domain.Permission;
import com.seps.ticket.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;


@Service
@Transactional
public class RoleService {

    private final Logger log = LoggerFactory.getLogger(RoleService.class);

    private final UserRepository userRepository;

    public RoleService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public Set<Permission> getUserPermissions(Long userId, String permissionName) {
        log.info("Get user permission");
        return userRepository.findById(userId)
            .map(user -> user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream()) // Collect permissions from all roles
                .filter(permission -> permissionName == null || permission.getName().equals(permissionName)) // Filter by permissionName if provided
                .collect(Collectors.toSet())) // Collect as a Set to avoid duplicates
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

}
