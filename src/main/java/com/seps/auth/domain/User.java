package com.seps.auth.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.seps.auth.config.Constants;
import com.seps.auth.enums.UserStatusEnum;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.BatchSize;

/**
 * A user.
 */
@Entity
@Table(name = "jhi_user")
public class User extends AbstractAuditingEntity<Long> implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @Pattern(regexp = Constants.LOGIN_REGEX)
    @Size(min = 1, max = 50)
    @Column(length = 50, unique = true, nullable = false)
    private String login;

    @JsonIgnore
    @NotNull
    @Size(min = 60, max = 60)
    @Column(name = "password_hash", length = 60, nullable = false)
    private String password;

    @Size(max = 50)
    @Column(name = "first_name", length = 50)
    private String firstName;

    @Size(max = 50)
    @Column(name = "last_name", length = 50)
    private String lastName;

    @Email
    @Size(min = 5, max = 254)
    @Column(length = 254, unique = true)
    private String email;

    @NotNull
    @Column(nullable = false)
    private boolean activated = false;

    @Size(min = 2, max = 10)
    @Column(name = "lang_key", length = 10)
    private String langKey;

    @Size(max = 256)
    @Column(name = "image_url", length = 256)
    private String imageUrl;

    @Size(max = 20)
    @Column(name = "activation_key", length = 20)
    @JsonIgnore
    private String activationKey;

    @Size(max = 20)
    @Column(name = "reset_key", length = 20)
    @JsonIgnore
    private String resetKey;

    @Column(name = "reset_date")
    private Instant resetDate = null;

    @JsonIgnore
    @ManyToMany
    @JoinTable(
        name = "jhi_user_authority",
        joinColumns = {@JoinColumn(name = "user_id", referencedColumnName = "id")},
        inverseJoinColumns = {@JoinColumn(name = "authority_name", referencedColumnName = "name")}
    )
    @BatchSize(size = 20)
    private Set<Authority> authorities = new HashSet<>();

    @Column(name = "otp_code", length = 6)
    private String otpCode;

    @Column(name = "otp_code_expiration_time")
    private Instant otpCodeExpirationTime;

    @Column(name = "otp_token", length = 36)
    private String otpToken;

    @Column(name = "otp_token_expiration_time")
    private Instant otpTokenExpirationTime;

    @Column(name = "last_logged_in")
    private Instant lastLoggedIn;

    @Column(name = "current_logged_in")
    private Instant currentLoggedIn;

    @Size(max = 5)
    @Column(name = "country_code", length = 5)
    private String countryCode;

    @Size(max = 15)
    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Enumerated
    @Column(name = "status", columnDefinition = "smallint")
    private UserStatusEnum status;

    @Column(name = "is_password_set")
    private boolean isPasswordSet = false;

    @Column(name = "identificacion", length = 20)
    private String identificacion;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "fingerprint_verified")
    private boolean fingerprintVerified;

    @Column(name = "fingerprint_verified_at")
    private Instant fingerprintVerifiedAt;

    @JsonIgnore
    @ManyToMany
    @JoinTable(
        name = "user_role",
        joinColumns = {@JoinColumn(name = "user_id", referencedColumnName = "id")},
        inverseJoinColumns = {@JoinColumn(name = "role_id", referencedColumnName = "id")}
    )
    @BatchSize(size = 20)
    private Set<Role> roles = new HashSet<>();

    @Column(name = "organization_id", insertable = false, updatable = false)
    private Long organizationId;

    @ManyToOne
    @JoinColumn(name = "organization_id", updatable = false)
    private Organization organization;

    @Column(name = "department", length = 255)
    private String department;

    @Column(name = "external_document_id", length = 255)
    private String externalDocumentId;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLogin() {
        return login;
    }

    // Lowercase the login before saving it in database
    public void setLogin(String login) {
        this.login = StringUtils.lowerCase(login, Locale.ENGLISH);
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isActivated() {
        return activated;
    }

    public void setActivated(boolean activated) {
        this.activated = activated;
    }

    public String getActivationKey() {
        return activationKey;
    }

    public void setActivationKey(String activationKey) {
        this.activationKey = activationKey;
    }

    public String getResetKey() {
        return resetKey;
    }

    public void setResetKey(String resetKey) {
        this.resetKey = resetKey;
    }

    public Instant getResetDate() {
        return resetDate;
    }

    public void setResetDate(Instant resetDate) {
        this.resetDate = resetDate;
    }

    public String getLangKey() {
        return langKey;
    }

    public void setLangKey(String langKey) {
        this.langKey = langKey;
    }

    public Set<Authority> getAuthorities() {
        return authorities;
    }

    public void setAuthorities(Set<Authority> authorities) {
        this.authorities = authorities;
    }

    public String getOtpCode() {
        return otpCode;
    }

    public void setOtpCode(String otpCode) {
        this.otpCode = otpCode;
    }

    public Instant getOtpCodeExpirationTime() {
        return otpCodeExpirationTime;
    }

    public void setOtpCodeExpirationTime(Instant otpCodeExpirationTime) {
        this.otpCodeExpirationTime = otpCodeExpirationTime;
    }

    public String getOtpToken() {
        return otpToken;
    }

    public void setOtpToken(String otpToken) {
        this.otpToken = otpToken;
    }

    public Instant getOtpTokenExpirationTime() {
        return otpTokenExpirationTime;
    }

    public void setOtpTokenExpirationTime(Instant otpTokenExpirationTime) {
        this.otpTokenExpirationTime = otpTokenExpirationTime;
    }

    public Instant getLastLoggedIn() {
        return lastLoggedIn;
    }

    public void setLastLoggedIn(Instant lastLoggedIn) {
        this.lastLoggedIn = lastLoggedIn;
    }

    public Instant getCurrentLoggedIn() {
        return currentLoggedIn;
    }

    public void setCurrentLoggedIn(Instant currentLoggedIn) {
        this.currentLoggedIn = currentLoggedIn;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public UserStatusEnum getStatus() {
        return status;
    }

    public void setStatus(UserStatusEnum status) {
        this.status = status;
    }

    public boolean isPasswordSet() {
        return isPasswordSet;
    }

    public void setPasswordSet(boolean passwordSet) {
        isPasswordSet = passwordSet;
    }

    public String getIdentificacion() {
        return identificacion;
    }

    public void setIdentificacion(String identificacion) {
        this.identificacion = identificacion;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public boolean isFingerprintVerified() {
        return fingerprintVerified;
    }

    public void setFingerprintVerified(boolean fingerprintVerified) {
        this.fingerprintVerified = fingerprintVerified;
    }

    public Instant getFingerprintVerifiedAt() {
        return fingerprintVerifiedAt;
    }

    public void setFingerprintVerifiedAt(Instant fingerprintVerifiedAt) {
        this.fingerprintVerifiedAt = fingerprintVerifiedAt;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getExternalDocumentId() {
        return externalDocumentId;
    }

    public void setExternalDocumentId(String externalDocumentId) {
        this.externalDocumentId = externalDocumentId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof User)) {
            return false;
        }
        return id != null && id.equals(((User) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "User{" +
            "login='" + login + '\'' +
            ", firstName='" + firstName + '\'' +
            ", lastName='" + lastName + '\'' +
            ", email='" + email + '\'' +
            ", imageUrl='" + imageUrl + '\'' +
            ", activated='" + activated + '\'' +
            ", langKey='" + langKey + '\'' +
            ", activationKey='" + activationKey + '\'' +
            "}";
    }
}
