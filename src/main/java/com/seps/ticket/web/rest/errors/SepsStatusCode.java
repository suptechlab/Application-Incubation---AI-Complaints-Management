package com.seps.ticket.web.rest.errors;

import org.zalando.problem.StatusType;

public enum SepsStatusCode implements StatusType {

    USERNAME_PASSWORD_INVALID(10010, "username.password.failed.validation"),
    RECAPTCHA_FAILED(10011, "recaptcha.failed.validation"),
    FORM_VALIDATION_ERROR(10012, "form.validation.error"),
    USER_NOT_FOUND(10013, "user.not.found"),
    CURRENT_USER_NOT_FOUND(10017, "current.user.not.found"),
    USER_ACCOUNT_NOT_EXIST(10027, "user.account.not.exist"),
    USER_ACCOUNT_NOT_ACTIVE(10028, "user.account.not.active"),
    USER_ACCOUNT_STATUS_PENDING(10029, "user.account.status.pending"),
    USER_ACCOUNT_STATUS_BLOCKED(10030, "user.account.status.blocked"),
    USER_ACCOUNT_STATUS_DELETED(10031, "user.account.status.deleted"),
    CLAIM_TYPE_NOT_FOUND(20015, "claim.type.not.found"),
    CLAIM_SUB_TYPE_NOT_FOUND(20017, "claim.sub.type.not.found"),
    PROVINCE_NOT_FOUND(20019, "province.not.found"),
    CITY_NOT_FOUND(20019, "city.not.found"),
    ORGANIZATION_NOT_FOUND(20030, "organization.not.found"),
    INVALID_DATE_FORMAT(20024, "invalid.date.format"),
    CLAIM_TICKET_NOT_FOUND(40010, "claim.ticket.not.found"),
    IS_NOT_FI_AGENT(40011,"is.not.fi.agent"),
    IS_NOT_SEPS_AGENT(40012,"is.not.seps.agent"),
    NO_TICKET_FOUND_WITH_PROVIDED_IDS(40013,"no.ticket.found.with.provided.ids"),
    YOU_NOT_AUTHORIZED_TO_PERFORM(40014,"not.authorized.to.perform");

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
