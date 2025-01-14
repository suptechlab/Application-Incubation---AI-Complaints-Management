package com.seps.ticket.web.rest.errors;

import org.zalando.problem.StatusType;

public enum SepsStatusCode implements StatusType {

    USERNAME_PASSWORD_INVALID(10010, "username.password.failed.validation"),
    RECAPTCHA_FAILED(10011, "recaptcha.failed.validation"),
    FORM_VALIDATION_ERROR(10012, "form.validation.error"),
    USER_NOT_FOUND(10013, "user.not.found"),
    CURRENT_USER_NOT_FOUND(10017, "current.user.not.found"),
    EMAIL_ALREADY_USED(10023, "email.already.used"),
    USER_IDENTIFICATION_ALREADY_EXIST(10024, "user.identification.already.exist"),
    USER_ACCOUNT_NOT_EXIST(10027, "user.account.not.exist"),
    USER_ACCOUNT_NOT_ACTIVE(10028, "user.account.not.active"),
    USER_ACCOUNT_STATUS_PENDING(10029, "user.account.status.pending"),
    USER_ACCOUNT_STATUS_BLOCKED(10030, "user.account.status.blocked"),
    USER_ACCOUNT_STATUS_DELETED(10031, "user.account.status.deleted"),
    SOMETHING_GOES_WRONG(10032, "something.goes.wrong"),
    CLAIM_TYPE_NOT_FOUND(20015, "claim.type.not.found"),
    CLAIM_SUB_TYPE_NOT_FOUND(20017, "claim.sub.type.not.found"),
    PROVINCE_NOT_FOUND(20019, "province.not.found"),
    CITY_NOT_FOUND(20019, "city.not.found"),
    INVALID_DATE_FORMAT(20024, "invalid.date.format"),
    PERSON_NOT_FOUND(20030, "person.not.found"),
    ORGANIZATION_RUC_NOT_FOUND(20031, "organization.ruc.not.found"),
    ORGANIZATION_NOT_FOUND(20032, "organization.not.found"),
    CLAIM_TICKET_NOT_FOUND(40010, "claim.ticket.not.found"),
    IS_NOT_FI_AGENT(40011, "is.not.fi.agent"),
    IS_NOT_SEPS_AGENT(40012, "is.not.seps.agent"),
    NO_TICKET_FOUND_WITH_PROVIDED_IDS(40013, "no.ticket.found.with.provided.ids"),
    YOU_NOT_AUTHORIZED_TO_PERFORM(40014, "not.authorized.to.perform"),
    INVALID_FILE(40015, "invalid.file"),
    FILE_STORAGE_ERROR(40016, "file.storage.error"),
    INVALID_SLA_DATE(40017, "invalid.sla.date"),
    CLAIM_TICKET_NOT_ASSIGNED(40018, "claim.ticket.not.assigned"),
    INVALID_INSTANCE_TYPE_ALLOW_ONLY_INSTANCE(40019, "invalid.instance.type.allow.only.instance"),
    CLAIM_TICKET_ALREADY_CLOSED_OR_REJECT(40020, "claim.ticket.already.closed.or.reject"),
    SECOND_INSTANCE_INVALID_CLAIM_TICKET_STATUS(40021, "second.instance.invalid.claim.ticket.status"),
    CLAIM_TICKET_ALREADY_CLOSED_OR_REJECTED_YOU_CANNOT_REPLY(40022, "claim.ticket.already.closed.or.rejected.you.cannot.reply"),
    COMPLAINT_INVALID_CLAIM_TICKET_STATUS(40023, "complaint.invalid.claim.ticket.status"),
    CLAIM_TICKET_WORKFLOW_NOT_FOUND(20030, "claim.ticket.workflow.not.found"),
    CLAIM_TICKET_ALLOW_ONLY_STATUS(20031, "claim.ticket.allow.only.status"),
    CLAIM_TICKET_ALREADY_IN_STATUS(20032, "claim.ticket.already.in.status"),
    UNAUTHORIZED_ACCESS(200046, "unauthorized.access"),
    AUTHORITY_NOT_FOUND(40023, "authority.not.found"),
    INVALID_USER_EMAIL_FOR_CLAIM(40028, "invalid.user.email.for.claim"),
    OTP_COD_ALREADY_USED(40029, "otp.already.used"),
    INVALID_OTP_CODE(40030, "invalid.otp.code"),
    EMAIL_NOT_VERIFIED(40031, "email.not.verified"),
    SECOND_INSTANCE_CLAIM_TICKET_ALREADY_CREATED(40032, "second.instance.claim.ticket.already.created"),
    COMPLAINT_CLAIM_TICKET_ALREADY_CREATED(40033, "complaint.claim.ticket.already.created");

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
