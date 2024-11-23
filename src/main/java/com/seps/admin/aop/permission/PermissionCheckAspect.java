package com.seps.admin.aop.permission;

import com.seps.admin.domain.Permission;
import com.seps.admin.domain.User;
import com.seps.admin.service.RoleService;
import com.seps.admin.service.UserService;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;
import org.zalando.problem.Status;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Aspect
@Component
public class PermissionCheckAspect {

    private final RoleService roleService;
    private final UserService userService;

    public PermissionCheckAspect(RoleService roleService, UserService userService) {
        this.roleService = roleService;
        this.userService = userService;
    }

    @Before("@annotation(permissionCheck) && execution(* com.seps.admin.web.rest..*(..))")
    public void checkPermission(PermissionCheck permissionCheck) {
        String[] requiredPermissions = permissionCheck.value();

        User user = userService.getCurrentUser();

        // Allow access if the user is an admin
        if (user.getAuthorities().stream().anyMatch(authority -> authority.getName().equals("ROLE_ADMIN"))) {
            return;
        }

        // Get all permissions assigned to the user
        Set<String> userPermissions = roleService.getUserPermissions(user.getId(), null).stream()
            .map(Permission::getName)
            .collect(Collectors.toSet());

        // Allow access if the user has any one of the required permissions
        boolean hasPermission = Arrays.stream(requiredPermissions)
            .anyMatch(userPermissions::contains);

        if (!hasPermission) {
            throw new CustomException(Status.UNAUTHORIZED, SepsStatusCode.UNAUTHORIZED_ACCESS, null, null);
        }
    }
}
