package com.seps.ticket.web.rest.vm;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class VerifyOTPVM {

    @NotBlank
    @Email
    @Size(min = 5, max = 200)
    private String email;

    @NotBlank
    private String otpCode;


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

    @Override
    public String toString() {
        return "VerifyOtpDTO{" +
            "email='" + email + '\'' +
            ", otpCode='" + otpCode + '\'' +
            '}';
    }
}
