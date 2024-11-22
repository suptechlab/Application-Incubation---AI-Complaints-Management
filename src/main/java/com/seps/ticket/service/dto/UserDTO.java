package com.seps.ticket.service.dto;

import com.seps.ticket.enums.UserStatusEnum;
import lombok.Data;
import lombok.ToString;

import java.time.Instant;
import java.util.Set;

@Data
@ToString
public class UserDTO {
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
    private String gender;
    private Boolean fingerprintVerified;
    private Instant fingerprintVerifiedAt;
    private Set<String> authorities;
    private Set<RoleDTO> roles;
}
