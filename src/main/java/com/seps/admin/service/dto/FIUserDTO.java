package com.seps.admin.service.dto;

import com.seps.admin.enums.UserStatusEnum;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.Instant;
import java.util.Set;

@Data
public class FIUserDTO {
    private Long id;
    private String login;
    @NotBlank
    @Size(max = 200)
    private String name;
    @NotBlank
    @Email
    @Size(min = 5, max = 200)
    private String email;
    @Size(max = 256)
    private String imageUrl;
    private boolean activated = false;
    @Size(min = 2, max = 10)
    private String langKey;
    @Size(max = 5)
    private String countryCode;
    @Size(max = 15)
    private String phoneNumber;
    private String createdBy;
    private Instant createdDate;
    private String lastModifiedBy;
    private Instant lastModifiedDate;
    private Set<String> authorities;
    @NotNull
    private Long roleId;
    private Set<RoleDTO> roles;
    private UserStatusEnum status;
    private boolean isPasswordSet;
    @NotBlank
    private String identificacion;
    @NotBlank
    private String ruc;
    private OrganizationDTO organization;
}
