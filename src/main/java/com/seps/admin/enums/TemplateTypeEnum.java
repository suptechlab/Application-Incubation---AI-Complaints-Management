package com.seps.admin.enums;

public enum TemplateTypeEnum {
    EMAIL("Email"),
    NOTIFICATION("Notification");

    private final String code;

    TemplateTypeEnum(String code) {
        this.code = code;
    }
}
