package com.seps.admin.enums;

import lombok.Getter;

@Getter
public enum TeamEntityTypeEnum {
    SEPS("SEPS Internal"),
    FI("Financial Institute");

    private final String code;

    TeamEntityTypeEnum(String code) {
        this.code = code;
    }

}
