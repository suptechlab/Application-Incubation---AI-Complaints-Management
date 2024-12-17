package com.seps.ticket.enums;

import com.seps.ticket.component.EnumWithDescription;

public enum ClaimTicketStatusEnum implements EnumWithDescription {
    NEW("enum.new"),
    ASSIGNED("enum.assigned"),
    IN_PROGRESS("enum.in.progress"),
    PENDING("enum.pending"),
    REJECTED("enum.rejected"),
    CLOSED("enum.closed");

    private final String key;

    ClaimTicketStatusEnum(String key) {
        this.key = key;
    }

    @Override
    public String getDescription() {
        return this.key;
    }
}
