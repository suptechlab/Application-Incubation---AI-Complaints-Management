package com.seps.admin.web.rest.errors;

import org.zalando.problem.StatusType;

public enum SepsStatusCode implements StatusType {

    USERNAME_PASSWORD_INVALID(10010, "username.password.failed.validation"),
    FORM_VALIDATION_ERROR(10012, "form.validation.error"),
    DUPLICATE_INQUIRY_TYPE(20010, "duplicate.inquiry.type"),
    INQUIRY_TYPE_NOT_FOUND(20011, "inquiry.type.not.found"),
    DUPLICATE_INQUIRY_SUB_TYPE(20012, "duplicate.inquiry.sub.type"),
    INQUIRY_SUB_TYPE_NOT_FOUND(20013, "inquiry.sub.type.not.found"),
    DUPLICATE_CLAIM_TYPE(20014, "duplicate.claim.type"),
    CLAIM_TYPE_NOT_FOUND(20015, "claim.type.not.found"),
    DUPLICATE_CLAIM_SUB_TYPE(20016, "duplicate.claim.sub.type"),
    CLAIM_SUB_TYPE_NOT_FOUND(20017, "claim.sub.type.not.found");

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
