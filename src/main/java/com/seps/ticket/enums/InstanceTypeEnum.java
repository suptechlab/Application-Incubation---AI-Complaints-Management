package com.seps.ticket.enums;

import com.seps.ticket.component.EnumWithDescription;

public enum InstanceTypeEnum implements EnumWithDescription {
    FIRST_INSTANCE("enum.first.instance"),
    SECOND_INSTANCE("enum.second.instance"),
    COMPLAINT("enum.complaint");

    private final String key;

    InstanceTypeEnum(String key) {
        this.key = key;
    }

    @Override
    public String getDescription() {
        return this.key;
    }
}
