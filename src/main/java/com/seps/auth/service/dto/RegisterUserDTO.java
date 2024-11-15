package com.seps.auth.service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

public class RegisterUserDTO implements Serializable {

    @NotBlank
    private String identificacion;

    @NotBlank
    private String individualDactilar;

    @Email
    @Size(min = 5, max = 254)
    private String email;

    @NotBlank
    private String otpCode;

    @Size(max = 5)
    private String countryCode;

    @Size(max = 15)
    private String phoneNumber;

    public RegisterUserDTO() {

    }

    public String getIdentificacion() {
        return identificacion;
    }

    public void setIdentificacion(String identificacion) {
        this.identificacion = identificacion;
    }

    public String getIndividualDactilar() {
        return individualDactilar;
    }

    public void setIndividualDactilar(String individualDactilar) {
        this.individualDactilar = individualDactilar;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtpCode() {
        return otpCode;
    }

    public void setOtpCode(String otpCode) {
        this.otpCode = otpCode;
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

    @Override
    public String toString() {
        return "RegisterUserDTO{" +
            "identificacion='" + identificacion + '\'' +
            ", individualDactilar='" + individualDactilar + '\'' +
            ", email='" + email + '\'' +
            ", otpCode='" + otpCode + '\'' +
            ", countryCode='" + countryCode + '\'' +
            ", phoneNumber='" + phoneNumber + '\'' +
            '}';
    }
}
