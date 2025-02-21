package com.seps.auth.service;

import com.seps.auth.domain.*;
import com.seps.auth.domain.Module;
import com.seps.auth.repository.*;
import com.seps.auth.service.dto.*;
import com.seps.auth.service.mapper.RoleMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;


@Service
@Transactional
public class RoleService {

    private final Logger log = LoggerFactory.getLogger(RoleService.class);

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;
    private final ModuleRepository moduleRepository;
    public RoleService(RoleRepository roleRepository, RoleMapper roleMapper, ModuleRepository moduleRepository) {
        this.roleRepository = roleRepository;
        this.roleMapper = roleMapper;
        this.moduleRepository = moduleRepository;
    }

    public Optional<RoleDTO> findOneUserPermission(Long id) {
        log.debug("Request to get Role : {}", id);
        return roleRepository.findById(id)
            .map(role -> {
                RoleDTO roleDTO = roleMapper.toDto(role);

                // Fetch all modules with their permissions assigned to the role
                List<Module> assignedModules = moduleRepository.findAllWithPermissions().stream()
                    .filter(module -> module.getPermissions().stream()
                        .anyMatch(permission -> role.getRolePermissions().stream()
                            .anyMatch(rolePermission -> rolePermission.getPermission().getId().equals(permission.getId()))
                        )
                    ).toList();

                List<RoleDTO.ModuleDTO> moduleDTOs = assignedModules.stream().map(module -> {
                    RoleDTO.ModuleDTO moduleDTO = new RoleDTO.ModuleDTO();
                    moduleDTO.setId(module.getId());
                    moduleDTO.setName(module.getName());

                    List<RoleDTO.PermissionDTO> permissionDTOs = module.getPermissions().stream()
                        .filter(permission -> role.getRolePermissions().stream()
                            .anyMatch(rolePermission -> rolePermission.getPermission().getId().equals(permission.getId()))
                        )
                        .map(permission -> {
                            RoleDTO.PermissionDTO permissionDTO = new RoleDTO.PermissionDTO();
                            permissionDTO.setId(permission.getId());
                            permissionDTO.setName(permission.getName());
                            permissionDTO.setChecked(true); // since we are only including assigned permissions, they are all checked
                            return permissionDTO;
                        }).toList();

                    moduleDTO.setPermissions(permissionDTOs);
                    return moduleDTO;
                }).toList();

                roleDTO.setModules(moduleDTOs);
                return roleDTO;
            });
    }

    public List<RoleDTO> findRolesWithPermissions(List<Long> roleIds) {
        log.debug("Request to get Roles: {}", roleIds);

        // Fetch roles by IDs where status is true
        List<Role> roles = roleRepository.findByIdInAndStatusTrue(roleIds);

        if (roles.isEmpty()) {
            return List.of(); // Return an empty list if no roles are found
        }

        // Fetch all modules with their permissions once to avoid repeated database calls
        List<Module> allModulesWithPermissions = moduleRepository.findAllWithPermissions();

        return roles.stream().map(role -> {
            RoleDTO roleDTO = roleMapper.toDto(role);

            // Filter modules that have permissions assigned to this specific role
            List<Module> assignedModules = allModulesWithPermissions.stream()
                .filter(module -> module.getPermissions().stream()
                    .anyMatch(permission -> role.getRolePermissions().stream()
                        .anyMatch(rolePermission -> rolePermission.getPermission().getId().equals(permission.getId()))
                    )
                ).toList();

            List<RoleDTO.ModuleDTO> moduleDTOs = assignedModules.stream().map(module -> {
                RoleDTO.ModuleDTO moduleDTO = new RoleDTO.ModuleDTO();
                moduleDTO.setId(module.getId());
                moduleDTO.setName(module.getName());

                List<RoleDTO.PermissionDTO> permissionDTOs = module.getPermissions().stream()
                    .filter(permission -> role.getRolePermissions().stream()
                        .anyMatch(rolePermission -> rolePermission.getPermission().getId().equals(permission.getId()))
                    )
                    .map(permission -> {
                        RoleDTO.PermissionDTO permissionDTO = new RoleDTO.PermissionDTO();
                        permissionDTO.setId(permission.getId());
                        permissionDTO.setName(permission.getName());
                        permissionDTO.setChecked(true); // Assigned permissions are always checked
                        return permissionDTO;
                    }).toList();

                moduleDTO.setPermissions(permissionDTOs);
                return moduleDTO;
            }).toList();

            roleDTO.setModules(moduleDTOs);
            return roleDTO;
        }).toList();
    }

}
