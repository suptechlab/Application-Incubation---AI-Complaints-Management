package com.seps.admin.service;

import com.seps.admin.config.Constants;
import com.seps.admin.domain.*;
import com.seps.admin.domain.Module;
import com.seps.admin.enums.UserTypeEnum;
import com.seps.admin.repository.*;
import com.seps.admin.service.dto.*;
import com.seps.admin.service.mapper.RoleMapper;
import com.seps.admin.service.specification.RoleSpecification;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

import java.util.*;

@Service
@Transactional
public class RoleService {

    private final Logger log = LoggerFactory.getLogger(RoleService.class);

    private final RoleRepository roleRepository;

    private final RoleMapper roleMapper;

    private final UserRepository userRepository;


    private final ModuleRepository moduleRepository;

    private final RolePermissionRepository rolePermissionRepository;
    private final UserService userService;

    public RoleService(RoleRepository roleRepository, RoleMapper roleMapper, UserRepository userRepository, ModuleRepository moduleRepository, RolePermissionRepository rolePermissionRepository,
                       UserService userService) {
        this.roleRepository = roleRepository;
        this.roleMapper = roleMapper;
        this.userRepository = userRepository;
        this.moduleRepository = moduleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.userService = userService;

    }

    /**
     * Save a role.
     * @param roleDTO the entity to save.
     * @return the persisted entity.
     */
    public RoleDTO save(RoleDTO roleDTO, RequestInfo requestInfo) {
        log.debug("Request to save Role : {}", roleDTO);
        User user = userService.getCurrentUser();
        Role role = roleMapper.toEntity(roleDTO);
        role.setCreatedBy(user.getId());
        role = roleRepository.save(role);
        // Save role permissions
        if (roleDTO.getPermissionIds() != null) {
            Role finalRole = role;
            List<RolePermission> rolePermissions = roleDTO.getPermissionIds().stream()
                .map(permissionId -> {
                    RolePermission rolePermission = new RolePermission();
                    rolePermission.setRole(finalRole);
                    Permission permission = new Permission();
                    permission.setId(permissionId);
                    rolePermission.setPermission(permission);
                    return rolePermission;
                })
                .toList();
            rolePermissionRepository.saveAll(rolePermissions);
        }
        return roleMapper.toDto(role);
    }

    /**
     * Update a role.
     * @param roleDTO the entity to update.
     */
    public void update(Long id, RoleDTO roleDTO) {
        log.debug("Request to update Role : {}", roleDTO);

        Role role = getRole(id);
        // Update role details
        role.setName(roleDTO.getName());
        role.setDescription(roleDTO.getDescription());
        role = roleRepository.save(role);

        // Fetch existing role permissions
        List<RolePermission> existingRolePermissions = rolePermissionRepository.findByRoleId(role.getId());

        // Determine permissions to add and remove
        List<Long> existingPermissionIds = existingRolePermissions.stream()
            .map(rolePermission -> rolePermission.getPermission().getId())
            .toList();

        List<Long> newPermissionIds = roleDTO.getPermissionIds();

        // Remove permissions that are no longer associated
        List<RolePermission> permissionsToRemove = existingRolePermissions.stream()
            .filter(rolePermission -> !newPermissionIds.contains(rolePermission.getPermission().getId()))
            .toList();
        rolePermissionRepository.deleteAll(permissionsToRemove);

        // Add new permissions
        Role finalRole = role;
        List<RolePermission> permissionsToAdd = newPermissionIds.stream()
            .filter(permissionId -> !existingPermissionIds.contains(permissionId))
            .map(permissionId -> {
                RolePermission rolePermission = new RolePermission();
                rolePermission.setRole(finalRole);
                Permission permission = new Permission();
                permission.setId(permissionId);
                rolePermission.setPermission(permission);
                return rolePermission;
            })
            .toList();
        rolePermissionRepository.saveAll(permissionsToAdd);

    }

    private Role getRole(Long roleId) {
        return roleRepository.findById(roleId)
            .orElseThrow(() -> new CustomException(
                Status.BAD_REQUEST,
                SepsStatusCode.ROLE_NOT_FOUND,
                null,
                null
            ));
    }


    /**
     * Get all the roles.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<RoleDTO> findAll(Pageable pageable, String search, Boolean status) {
        log.debug("Request to get all Roles with search filter: {}", search);
        return roleRepository.findAll(RoleSpecification.byFilter(search,status), pageable)
                .map(roleMapper::toDto);

    }

    @Transactional(readOnly = true)
    public List<DropdownListDTO> findAll(UserTypeEnum userType) {
        log.debug("Request to get all Roles");
        return roleRepository.findByUserTypeAndDeletedFalse(userType.toString()).stream()
            .map(roleMapper::toDropDownDTO)
            .toList();
    }

    /**
     * Get one role by id.
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public RoleDTO findOne(Long id) {
        log.debug("Request to get Role detail : {}", id);
        return roleRepository.findById(id)
            .map(role -> {
                RoleDTO roleDTO = roleMapper.toDto(role);

                // Fetch all modules with their permissions
                List<Module> modules = moduleRepository.findAllWithPermissions(role.getUserType());

                List<RoleDTO.ModuleDTO> moduleDTOs = modules.stream().map(module -> {
                    RoleDTO.ModuleDTO moduleDTO = new RoleDTO.ModuleDTO();
                    moduleDTO.setId(module.getId());
                    if(LocaleContextHolder.getLocale().equals(Locale.forLanguageTag(Constants.DEFAULT_LANGUAGE))) {
                        moduleDTO.setName(module.getName());
                    }else{
                        moduleDTO.setName(module.getNameEs());
                    }

                    List<RoleDTO.PermissionDTO> permissionDTOs = module.getPermissions().stream()
                        .sorted(Comparator.comparing(Permission::getId)).map(permission -> {
                        RoleDTO.PermissionDTO permissionDTO = new RoleDTO.PermissionDTO();
                        permissionDTO.setId(permission.getId());
                        permissionDTO.setName(permission.getName());
                        if(LocaleContextHolder.getLocale().equals(Locale.forLanguageTag(Constants.DEFAULT_LANGUAGE))) {
                            permissionDTO.setDescription(permission.getDescription());
                        }else{
                            permissionDTO.setDescription(permission.getDescriptionEs());
                        }

                        boolean isChecked = role.getRolePermissions().stream()
                            .anyMatch(rolePermission -> rolePermission.getPermission().getId().equals(permission.getId()));

                        permissionDTO.setChecked(isChecked);
                        return permissionDTO;
                    }).toList();

                    moduleDTO.setPermissions(permissionDTOs);
                    return moduleDTO;
                }).toList();

                roleDTO.setModules(moduleDTOs);
                return roleDTO;
            }).orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.ROLE_NOT_FOUND,
                        new String[]{id.toString()}, null));
    }


    @Transactional(readOnly = true)
    public List<ModuleDTO> getAllModulesWithPermissions(UserTypeEnum userType) {
        List<Module> modules = moduleRepository.findAllWithPermissions(userType.toString());

        return modules.stream()
            .map(module -> {
                ModuleDTO moduleDTO = new ModuleDTO();
                moduleDTO.setId(module.getId());
                if(LocaleContextHolder.getLocale().equals(Locale.forLanguageTag(Constants.DEFAULT_LANGUAGE))) {
                    moduleDTO.setName(module.getName());
                    moduleDTO.setDescription(module.getDescription());
                }else{
                    moduleDTO.setName(module.getNameEs());
                    moduleDTO.setDescription(module.getDescriptionEs());
                }
                moduleDTO.setPermissions(module.getPermissions().stream().sorted(Comparator.comparing(Permission::getId)).map(permission -> {
                    PermissionDTO permissionDTO = new PermissionDTO();
                    permissionDTO.setId(permission.getId());
                    permissionDTO.setName(permission.getName());
                    if(LocaleContextHolder.getLocale().equals(Locale.forLanguageTag(Constants.DEFAULT_LANGUAGE))) {
                        permissionDTO.setDescription(permission.getDescription());
                    }else{
                        permissionDTO.setDescription(permission.getDescriptionEs());
                    }
                    permissionDTO.setChecked(false);
                    return permissionDTO;
                }).toList());
                return moduleDTO;
            })
            .toList();
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
//    public Set<Permission> getUserPermissions(Long userId, String permissionName) {
//        return userRepository.findById(userId)
//            .map(user -> roleRepository.findById(user.getRole().getId())
//                .orElseThrow(() -> new IllegalArgumentException("Role not found"))
//                .getPermissions().stream()
//                .filter(permission -> permission.getName().equals(permissionName))
//                .collect(Collectors.toSet()))
//            .orElseThrow(() -> new IllegalArgumentException("User not found"));
//    }
//
//    public long countRelatedUsers(Long roleId) {
//        return userRepository.countByRoleId(roleId);
//    }
//
//    public List<User> getDataReviewerUserList(Long companyId){
//        return userRepository.findUsersWithPermission(Constants.DATA_REVIEWER_PERMISSION, companyId);
//    }
}
