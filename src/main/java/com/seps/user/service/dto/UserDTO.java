package com.seps.user.service.dto;

import com.seps.user.domain.Authority;
import com.seps.user.domain.User;
import com.seps.user.enums.UserStatusEnum;
import lombok.Data;
import lombok.ToString;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@ToString
public class UserDTO {
    private Long id;
    private String login;
    private String name;
    private String email;
    private String imageUrl;
    private boolean activated;
    private String langKey;
    private String countryCode;
    private String phoneNumber;
    private Instant createdDate;
    private Instant lastModifiedDate;
    private Set<String> authorities;
    private UserStatusEnum status;
    private boolean isPasswordSet;
    private String identificacion;
    private String gender;
    private boolean fingerprintVerified;
    private Instant lastLoggedIn;
    private Instant currentLoggedIn;

    public UserDTO(User user) {
        this.id = user.getId();
        this.login = user.getLogin();
        this.name = user.getFirstName();
        this.email = user.getEmail();
        this.imageUrl = user.getImageUrl();
        this.activated = user.isActivated();
        this.langKey = user.getLangKey();
        this.countryCode = user.getCountryCode();
        this.phoneNumber = user.getPhoneNumber();
        this.createdDate = user.getCreatedDate();
        this.lastModifiedDate = user.getLastModifiedDate();
        this.authorities = user.getAuthorities().stream().map(Authority::getName).collect(Collectors.toSet());
        this.status = user.getStatus();
        this.isPasswordSet = user.isPasswordSet();
        this.identificacion = user.getIdentificacion();
        this.gender = user.getGender();
        this.fingerprintVerified = user.isFingerprintVerified();
        this.lastLoggedIn = user.getLastLoggedIn();
        this.currentLoggedIn = user.getCurrentLoggedIn();
    }
}
