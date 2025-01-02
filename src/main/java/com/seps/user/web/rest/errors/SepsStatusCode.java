package com.seps.user.web.rest.errors;

import org.zalando.problem.StatusType;

public enum SepsStatusCode implements StatusType {

    USERNAME_PASSWORD_INVALID(10010, "username.password.failed.validation"),
    FORM_VALIDATION_ERROR(10012, "form.validation.error"),
    USER_NOT_FOUND(10013, "user.not.found"),
    CURRENT_USER_NOT_FOUND(20020, "current.user.not.found"),
    FILE_STORAGE_ERROR(40016, "file.storage.error");

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
