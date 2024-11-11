package com.seps.admin.service;

import com.google.gson.Gson;
import com.seps.admin.config.Constants;
import com.seps.admin.domain.*;
import com.seps.admin.domain.Module;
import com.seps.admin.enums.ActionTypeEnum;
import com.seps.admin.enums.ActivityTypeEnum;
import com.seps.admin.enums.LanguageEnum;
import com.seps.admin.enums.UserTypeEnum;
import com.seps.admin.repository.*;
import com.seps.admin.service.dto.*;
import com.seps.admin.service.mapper.RoleMapper;
import com.seps.admin.service.specification.RoleSpecification;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

import java.util.*;

import static com.seps.admin.component.CommonHelper.convertEntityToMap;

@Service
@Transactional
public class RoleService {

    private final Logger log = LoggerFactory.getLogger(RoleService.class);

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;
    private final ModuleRepository moduleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final MessageSource messageSource;
    private final Gson gson;
    private final PermissionRepository permissionRepository;
    public RoleService(RoleRepository roleRepository, RoleMapper roleMapper, ModuleRepository moduleRepository, RolePermissionRepository rolePermissionRepository,
                       AuditLogService auditLogService, UserService userService, MessageSource messageSource,
                       Gson gson, PermissionRepository permissionRepository) {
        this.roleRepository = roleRepository;
        this.roleMapper = roleMapper;
        this.moduleRepository = moduleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.userService = userService;
        this.auditLogService = auditLogService;
        this.messageSource = messageSource;
        this.gson = gson;
        this.permissionRepository = permissionRepository;
    }

    /**
     * Save a role.
     * @param roleDTO the entity to save.
     * @return the persisted entity.
     */
    public Long save(RoleDTO roleDTO, RequestInfo requestInfo) {
        log.debug("Request to save Role : {}", roleDTO);
        User user = userService.getCurrentUser();
        // Validate duplicate role name
        validateDuplicateRoleName(roleDTO.getName(), roleDTO.getUserType(), roleDTO.getId());

        Role role = roleMapper.toEntity(roleDTO);
        role.setCreatedBy(user.getId());
        if(role.getStatus() == null){
            role.setStatus(true);
        }
        // Validate permissions based on userType
        String userType = roleDTO.getUserType();
        if (userType != null && !roleDTO.getPermissionIds().isEmpty()) {
            validatePermissionsByUserType(roleDTO.getPermissionIds(), userType);
        }

        Role saveRole = roleRepository.save(role);
        // Save role permissions
        if (roleDTO.getPermissionIds() != null) {
            List<RolePermission> rolePermissions = roleDTO.getPermissionIds().stream()
                .map(permissionId -> {
                    RolePermission rolePermission = new RolePermission();
                    rolePermission.setRole(saveRole);
                    Permission permission = new Permission();
                    permission.setId(permissionId);
                    rolePermission.setPermission(permission);
                    return rolePermission;
                })
                .toList();
            rolePermissionRepository.saveAll(rolePermissions);
        }

        Map<String, String> auditMessageMap = new HashMap<>();
        Map<String, Object> entityData = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.role.created",
                new Object[]{user.getEmail(), saveRole.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        entityData.put(Constants.NEW_DATA,convertEntityToMap(this.findOne(saveRole.getId())));
        String requestBody = gson.toJson(roleDTO);
        auditLogService.logActivity(null, user.getId(), requestInfo, "save", ActionTypeEnum.ROLE_ADD.name(), saveRole.getId(), Role.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.DATA_ENTRY.name(), requestBody);
        return saveRole.getId();
    }

    /**
     * Update a role.
     * @param roleDTO the entity to update.
     */
    public void update(Long id, RoleDTO roleDTO, RequestInfo requestInfo) {
        log.debug("Request to update Role : {}", roleDTO);

        // Validate duplicate role name
        validateDuplicateRoleName(roleDTO.getName(), roleDTO.getUserType(), id);

        // Validate permissions based on user type
        if (roleDTO.getPermissionIds() != null && !roleDTO.getPermissionIds().isEmpty()) {
            validatePermissionsByUserType(roleDTO.getPermissionIds(), roleDTO.getUserType());
        }
        Map<String, Object> oldData = convertEntityToMap(this.findOne(id));
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
        User currenUser = userService.getCurrentUser();
        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.role.updated",
                new Object[]{currenUser.getEmail(), id}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.findOne(id));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        String requestBody = gson.toJson(roleDTO);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "update", ActionTypeEnum.ROLE_EDIT.name(), id, Role.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);

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

    private void validatePermissionsByUserType(List<Long> permissionIds, String userType) {
        // Fetch valid permissions based on the `userType` from the `Module`
        List<Long> validPermissionIds = permissionRepository.findValidPermissionIdsByUserType(userType);

        // Check if all provided permissions are valid
        List<Long> invalidPermissions = permissionIds.stream()
            .filter(permissionId -> !validPermissionIds.contains(permissionId))
            .toList();

        if (!invalidPermissions.isEmpty()) {
            throw new CustomException(
                Status.BAD_REQUEST,
                SepsStatusCode.INVALID_PERMISSION_FOR_USER_TYPE,
                new String[]{userType},
                null
            );
        }
    }

    private void validateDuplicateRoleName(String roleName, String userType, Long roleId) {
        boolean exists = roleRepository.existsByNameIgnoreCaseAndUserTypeAndIdNot(roleName, userType, roleId);
        if (exists) {
            throw new CustomException(
                Status.BAD_REQUEST,
                SepsStatusCode.ROLE_NAME_ALREADY_EXIST,
                new String[]{roleName, userType},
                null
            );
        }
    }

    public void changeStatus(Long id, Boolean status, RequestInfo requestInfo) {
        Role entity = roleRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.NOT_FOUND, SepsStatusCode.ROLE_NOT_FOUND,
                new String[]{id.toString()}, null));
        Map<String, Object> oldData = new HashMap<>();
        oldData.put("Name", entity.getName());
        oldData.put("Description", entity.getDescription());
        oldData.put("status", entity.getStatus());
        entity.setStatus(status);
        User currenUser = userService.getCurrentUser();
        Role role = roleRepository.save(entity);

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.role.status.change",
                new Object[]{currenUser.getEmail(), role.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = new HashMap<>();
        newData.put("Name", role.getName());
        newData.put("Description", role.getDescription());
        newData.put("status", role.getStatus());
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        Map<String, String> req = new HashMap<>();
        req.put("status", status.toString());
        String requestBody = gson.toJson(req);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "changeStatus", ActionTypeEnum.ROLE_STATUS_CHANGE.name(), role.getId(), Role.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.STATUS_CHANGE.name(), requestBody);
    }
}
