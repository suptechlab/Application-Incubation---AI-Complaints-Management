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
    PERSON_NOT_FOUND(10021, "person.not.found"),
    ORGANIZATION_RUC_NOT_FOUND(10022, "organization.ruc.not.found"),
    EMAIL_ALREADY_USED(10023, "email.already.used"),
    USER_IDENTIFICATION_ALREADY_EXIST(10024, "user.identification.already.exist"),
    EMAIL_NOT_VERIFIED(10025, "email.not.verified"),
    FINGERPRINT_CODE_NOT_MATCHED(10026, "fingerprint.code.not.matched"),
    USER_ACCOUNT_NOT_EXIST(10027, "user.account.not.exist"),
    USER_ACCOUNT_NOT_ACTIVE(10028, "user.account.not.active"),
    USER_ACCOUNT_STATUS_PENDING(10029, "user.account.status.pending"),
    USER_ACCOUNT_STATUS_BLOCKED(10030, "user.account.status.blocked"),
    USER_ACCOUNT_STATUS_DELETED(10031, "user.account.status.deleted"),
    SOMETHING_GOES_WRONG(10032, "something.goes.wrong");
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
