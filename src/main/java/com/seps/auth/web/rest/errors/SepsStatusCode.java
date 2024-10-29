package com.seps.auth.web.rest.errors;

import org.zalando.problem.StatusType;

public enum SepsStatusCode implements StatusType {

    USERNAME_PASSWORD_INVALID(10010, "username.password.failed.validation"),
    RECAPTCHA_FAILED(10011, "recaptcha.failed.validation"),
    FORM_VALIDATION_ERROR(10012, "form.validation.error"),
    USER_NOT_FOUND(10013, "user.not.found"),
    INVALID_OTP_TOKEN(10014, "invalid.otp.token"),
    INVALID_OTP_CODE(10015, "invalid.otp.code"),
    USER_NOT_FOUND_RESET(10016, "user.not.found.reset");

    private final int code;

    private final String reason;

    SepsStatusCode(int code, String reason) {
        this.code = code;
        this.reason = reason;
    }


    @Override
    public int getStatusCode() {
        return this.code;
    }

    @Override
    public String getReasonPhrase() {
        return this.reason;
    }
}
