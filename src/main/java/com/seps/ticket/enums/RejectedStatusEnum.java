package com.seps.ticket.enums;

import com.seps.ticket.component.EnumWithDescription;

public enum RejectedStatusEnum implements EnumWithDescription {
    DUPLICATE("enum.duplicate"),
    MISSING_INFORMATION("enum.missing.information"),
    EXPIRED("enum.expired");

    private final String key;

    RejectedStatusEnum(String key) {
        this.key = key;
    }

    @Override
    public String getDescription() {
        return this.key;
    }
}
