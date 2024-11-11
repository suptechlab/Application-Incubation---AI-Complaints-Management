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
    CLAIM_SUB_TYPE_NOT_FOUND(20017, "claim.sub.type.not.found"),
    DUPLICATE_PROVINCE(20018, "duplicate.province"),
    PROVINCE_NOT_FOUND(20019, "province.not.found"),
    DUPLICATE_CITY(20018, "duplicate.city"),
    CITY_NOT_FOUND(20019, "city.not.found"),
    CURRENT_USER_NOT_FOUND(20020, "current.user.not.found"),
    AUDIT_LOG_NOT_FOUND(20021, "audit.log.not.found"),
    INVALID_DATE_FORMAT(20022, "invalid.date.format"),
    EMAIL_ALREADY_USED(20023, "email.already.used"),
    USER_NOT_FOUND(20024, "user.not.found"),
    SEPS_USER_NOT_FOUND(20025, "seps.user.not.found"),
    INVALID_STATUS_TRANSITION(20026, "invalid.status.transition"),
    ROLE_NOT_FOUND(20027, "role.not.found"),
    PERSON_NOT_FOUND(20028, "person.not.found"),
    ORGANIZATION_RUC_NOT_FOUND(20029, "organization.ruc.not.found"),
    ORGANIZATION_NOT_FOUND(20030, "organization.not.found"),
    ROLE_NAME_ALREADY_EXIST(20031, "role.name.already.exist"),
    INVALID_PERMISSION_FOR_USER_TYPE(20032, "invalid.permission.for.user.type");

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
