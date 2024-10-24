package com.seps.auth.service.dto;

import java.time.Instant;

public class OTPResponse {

    private String otpToken;
    private Instant otpTokenExpirationTime;

    public OTPResponse(String otpToken, Instant otpTokenExpirationTime) {
        this.otpToken = otpToken;
        this.otpTokenExpirationTime = otpTokenExpirationTime;
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
}
