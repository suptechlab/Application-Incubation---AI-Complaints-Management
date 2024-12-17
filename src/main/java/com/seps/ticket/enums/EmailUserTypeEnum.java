package com.seps.ticket.enums;

import com.seps.ticket.component.EnumWithDescription;

public enum EmailUserTypeEnum implements EnumWithDescription {
    SEPS("enum.email.user.type.seps"),
    FI("enum.email.user.type.fi"),
    CUSTOMER("enum.email.user.type.customer");

    private final String key;

    EmailUserTypeEnum(String key) {
        this.key = key;
    }

    @Override
    public String getDescription() {
        return this.key;
    }

}
