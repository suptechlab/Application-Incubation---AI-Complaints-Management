package com.seps.ticket.service.dto;

import com.seps.ticket.enums.UserStatusEnum;
import lombok.Data;

import java.util.Set;

import static com.seps.ticket.component.CommonHelper.capitalizeCustom;

@Data
public class FIUserDTO {
    private Long id;
    private String login;
    private String name;
    private String email;
    private String imageUrl;
    private boolean activated = false;
    private String langKey;
    private String countryCode;
    private String phoneNumber;
    private UserStatusEnum status;
    private String identificacion;
    private OrganizationDTO organization;
    private Set<String> authorities;
    private Set<RoleDTO> roles;

    // Custom setter for `name`
    public void setName(String name) {
        this.name = capitalizeCustom(name);
    }
}
