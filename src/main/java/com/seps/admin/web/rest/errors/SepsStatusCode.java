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
    DUPLICATE_CITY(20020, "duplicate.city"),
    CITY_NOT_FOUND(20021, "city.not.found"),
    CURRENT_USER_NOT_FOUND(20022, "current.user.not.found"),
    AUDIT_LOG_NOT_FOUND(20023, "audit.log.not.found"),
    INVALID_DATE_FORMAT(20024, "invalid.date.format"),
    EMAIL_ALREADY_USED(20025, "email.already.used"),
    USER_NOT_FOUND(20026, "user.not.found"),
    SEPS_USER_NOT_FOUND(20027, "seps.user.not.found"),
    INVALID_STATUS_TRANSITION(20028, "invalid.status.transition"),
    ROLE_NOT_FOUND(20029, "role.not.found"),
    PERSON_NOT_FOUND(20030, "person.not.found"),
    ORGANIZATION_RUC_NOT_FOUND(20031, "organization.ruc.not.found"),
    ORGANIZATION_NOT_FOUND(20032, "organization.not.found"),
    ROLE_NAME_ALREADY_EXIST(20033, "role.name.already.exist"),
    INVALID_PERMISSION_FOR_USER_TYPE(20034, "invalid.permission.for.user.type"),
    FI_USER_NOT_FOUND(20035, "fi.user.not.found"),
    FI_USER_ALREADY_EXIST(20036, "fi.user.already.exist"),
    DUPLICATE_TEMPLATE(20037,"duplicate.template"),
    TEMPLATE_NOT_FOUND(20038,"template.not.found"),
    SEPS_USER_VERIFICATION_FAILED(20039,"seps.user.verification.failed"),
    INVALID_MEMBER_LIST(20040,"invalid.member.list"),
    DUPLICATE_TEAM(20041,"duplicate.team"),
    MEMBER_ALREADY_ASSIGNED(20042,"member.already.assigned"),
    TEAM_NOT_FOUND(20043,"team.not.found"),
    NO_MEMBERS_TO_ASSIGN(20044,"no.member.to.assign"),
    MEMBER_NOT_FOUND_IN_TEAM(20045,"member.not.found.in.team"),
    UNAUTHORIZED_ACCESS(200046,"unauthorized.access"),
    TEMPLATE_ALREADY_EXISTS(200047,"template.email.already.exist");

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
