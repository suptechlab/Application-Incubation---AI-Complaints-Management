package com.seps.ticket.enums;

import com.seps.ticket.component.EnumWithDescription;

public enum ClaimTicketPriorityEnum implements EnumWithDescription {
    LOW("enum.low"),
    MEDIUM("enum.medium"),
    HIGH("enum.high");

    private final String key;

    ClaimTicketPriorityEnum(String key) {
        this.key = key;
    }

    @Override
    public String getDescription() {
        return this.key;
    }
}
