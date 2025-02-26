package com.seps.user.enums;

import com.seps.user.component.EnumWithDescription;

public enum ClosedStatusEnum implements EnumWithDescription {
    CLOSED_IN_FAVOR_OF_CONSUMER("enum.closed.in.favor.of.consumer"),
    CLOSED_IN_PARTIAL_FAVOR_OF_CONSUMER("enum.closed.in.partial.favor.of.consumer"),
    CLOSED_WITH_DENIED_REQUEST("enum.closed.with.denied.request"),
    CLOSE_WITH_EXPIRED("enum.closed.with.expired");

    private final String key;

    ClosedStatusEnum(String key) {
        this.key = key;
    }

    @Override
    public String getDescription() {
        return this.key;
    }
}
