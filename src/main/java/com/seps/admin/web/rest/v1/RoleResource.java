package com.seps.admin.web.rest.v1;

import com.seps.admin.aop.permission.PermissionCheck;
import com.seps.admin.enums.UserTypeEnum;
import com.seps.admin.service.RoleService;
import com.seps.admin.service.dto.*;
import com.seps.admin.service.dto.ResponseStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
public class RoleResource {

    private final Logger log = LoggerFactory.getLogger(RoleResource.class);

    private static final String ENTITY_NAME = "role";
    private final RoleService roleService;
    private final MessageSource messageSource;

    public RoleResource(RoleService roleService, MessageSource messageSource) {
        this.roleService = roleService;
        this.messageSource = messageSource;
    }

    @Operation(tags = {"Role Management"}, summary = "Create a new role", description = "Add a new role to the system")
    @PostMapping
    @PermissionCheck({"ROLE_AND_RIGHT_CREATE_BY_SEPS"})
    public ResponseEntity<ResponseStatus> createRole(@Valid @RequestBody RoleDTO roleDTO, HttpServletRequest request) throws URISyntaxException {
        log.debug("REST request to save Role : {}", roleDTO);
        RequestInfo requestInfo = new RequestInfo(request);
        Long id = roleService.save(roleDTO, requestInfo);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("role.created.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.CREATED.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.created(new URI("/api/v1/roles/" + id))
            .body(responseStatus);
    }

    @Operation(tags = {"Role Management"}, summary = "Update an existing role", description = "Update an existing role in the system")
    @PutMapping("/{id}")
    @PermissionCheck({"ROLE_AND_RIGHT_UPDATE_BY_SEPS"})
    public ResponseEntity<ResponseStatus> updateRole(@Valid @PathVariable Long id, @RequestBody RoleDTO roleDTO, HttpServletRequest request) {
        log.debug("REST request to update Role : {}", roleDTO);
        RequestInfo requestInfo = new RequestInfo(request);
        roleService.update(id, roleDTO, requestInfo);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("role.updated.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    @Operation(tags = {"Role Management"}, summary = "Get all roles", description = "Get a list of all roles in the system")
    @GetMapping
    public ResponseEntity<List<RoleDTO>> getAllRoles(Pageable pageable, @RequestParam(required = false) String search,
                                                     @RequestParam(required = false) Boolean status) {
        log.debug("REST request to get all Roles with search filter: {}", search);
        Page<RoleDTO> page = roleService.findAll(pageable, search, status);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @Operation(tags = {"Role Management"}, summary = "Get a role by ID", description = "Get a role by its ID")
    @GetMapping("/{id}")
    public ResponseEntity<RoleDTO> getRole(@PathVariable Long id) {
        log.debug("REST request to get Role : {}", id);
        return ResponseEntity.ok(roleService.findOne(id));
    }
/*
    @Operation(tags = {"Role Management"}, summary = "Delete a role by ID", description = "Delete a role by its ID")
    @DeleteMapping("/roles/{id}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<ResponseVM> deleteRole(@PathVariable Long id) {
        log.debug("REST request to delete Role : {}", id);
        // Check if there are related users in the jhi_user table
        long relatedUserCount = roleService.countRelatedUsers(id);
        if (relatedUserCount > 0) {
            String message = messageSource.getMessage("role.cannot.be.delete.as.assigned.to.user", null, Locale.getDefault());
            ResponseVM payload = new ResponseVM(HttpStatus.BAD_REQUEST.value(), message, System.currentTimeMillis(), null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(payload);
        }
        roleService.delete(id);
        String message = "Role deleted successfully";
        ResponseVM payload = new ResponseVM(HttpStatus.NO_CONTENT.value(), message, System.currentTimeMillis(), null);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(payload);
    }*/

    @Operation(tags = {"Role Management"}, summary = "Get all modules and permissions", description = "Get a list of all modules and their permissions")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Modules and permissions retrieved successfully")
    })
    @GetMapping("/modules-permissions/{userType}")
    public ResponseEntity<List<ModuleDTO>> getModulesAndPermissions(@PathVariable UserTypeEnum userType) {
        log.debug("REST request to get all modules and their permissions");
        List<ModuleDTO> modules = roleService.getAllModulesWithPermissions(userType);
        return ResponseEntity.ok(modules);
    }

    @Operation(tags = {"Role Management"}, summary = "Get all roles for dropdown", description = "Get a list of all roles for dropdown")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Roles retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/dropdown/{userType}")
    public ResponseEntity<List<DropdownListDTO>> getAllRoles(@Valid @PathVariable UserTypeEnum userType) {
        log.debug("REST request to get all Roles");
        List<DropdownListDTO> roles = roleService.findAll(userType);
        return ResponseEntity.ok(roles);
    }
    @Operation(summary = "Change the status of a Role", description = "Update the status of a role (active/inactive).")
    @ApiResponse(responseCode = "204", description = "Status changed successfully")
    @PatchMapping("/{id}/status")
    @PermissionCheck({"ROLE_AND_RIGHT_STATUS_CHANGE_BY_SEPS"})
    public ResponseEntity<Void> roleChangeStatus(@PathVariable Long id, @RequestParam Boolean status, HttpServletRequest request) {
        RequestInfo requestInfo = new RequestInfo(request);
        roleService.changeStatus(id, status, requestInfo);
        return ResponseEntity.noContent().build();
    }
}
