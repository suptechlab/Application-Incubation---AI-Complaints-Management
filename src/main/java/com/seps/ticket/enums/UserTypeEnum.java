package com.seps.ticket.enums;

import lombok.Getter;

@Getter
public enum UserTypeEnum {
    SEPS_USER("SEPS User"),
    FI_USER("FI User");

    private final String code;

    UserTypeEnum(String code) {
        this.code = code;
    }

}
