package com.seps.ticket.enums;

public enum ActionTypeEnum {

    CLAIM_TICKET_ADD("Claim Ticket Add");
    private final String description;

    ActionTypeEnum(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
