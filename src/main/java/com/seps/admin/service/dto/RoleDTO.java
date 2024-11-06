package com.seps.admin.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.util.List;

@Data
public class RoleDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    @NotBlank
    @Size(min = 3, max = 250)
    private String name;
    @NotBlank
    @Size(min = 3, max = 250)
    private String description;
    private Long createdBy;
    private Instant createdAt;
    private Instant updatedAt;
    private Boolean deleted = false;
    private List<Long> permissionIds;
    private List<ModuleDTO> modules;


    @Data
    public static class ModuleDTO implements Serializable {

        @Serial
        private static final long serialVersionUID = 1L;

        private Long id;
        private String name;
        private List<PermissionDTO> permissions;

    }

    @Data
    public static class PermissionDTO implements Serializable{

        @Serial
        private static final long serialVersionUID = 1L;

        private Long id;
        private String name;
        private String description;
        private boolean checked;

    }
}
