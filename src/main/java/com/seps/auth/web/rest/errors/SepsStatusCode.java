package com.seps.auth.web.rest.errors;

import org.zalando.problem.StatusType;

public enum SepsStatusCode implements StatusType {

    USERNAME_PASSWORD_INVALID(10010, "username.password.failed.validation"),
    RECAPTCHA_FAILED(10011, "recaptcha.failed.validation"),
    FORM_VALIDATION_ERROR(10012, "form.validation.error"),
    USER_NOT_FOUND(10013, "user.not.found"),
    INVALID_OTP_TOKEN(10014, "invalid.otp.token"),
    INVALID_OTP_CODE(10015, "invalid.otp.code"),
    USER_NOT_FOUND_RESET(10016, "user.not.found.reset"),
    CURRENT_USER_NOT_FOUND(10017, "current.user.not.found"),
    USER_PASSWORD_INCORRECT(10018, "user.password.incorrect"),
    NEW_PASSWORD_SAME_AS_CURRENT(10019, "new.password.same.as.current"),
    OTP_COD_ALREADY_USED(10020, "otp.already.used"),
    PERSON_NOT_FOUND(20028, "person.not.found"),
    ORGANIZATION_RUC_NOT_FOUND(20029, "organization.ruc.not.found");

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
