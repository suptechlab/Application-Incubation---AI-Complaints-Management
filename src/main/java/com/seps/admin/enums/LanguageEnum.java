package com.seps.admin.enums;

import lombok.Getter;

@Getter
public enum LanguageEnum {
    ENGLISH("en"),
    SPANISH("es");

    private final String code;

    LanguageEnum(String code) {
        this.code = code;
    }

}
