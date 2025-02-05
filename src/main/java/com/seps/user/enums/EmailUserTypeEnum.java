package com.seps.user.enums;

import lombok.Getter;

@Getter
public enum EmailUserTypeEnum {
    SEPS("SEPS"),
    FI("Financial Institute"),
    CUSTOMER("Customer");

    private final String code;

    EmailUserTypeEnum(String code) {
        this.code = code;
    }

}
