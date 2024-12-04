package com.seps.ticket.enums;

public enum ActionTypeEnum {

    CLAIM_TICKET_ADD("Claim Ticket Add"),
    CLAIM_TICKET_EXTEND_SLA_DATE("Claim Ticket Extend SLA date"),
    CLAIM_TICKET_CLOSED("Claim Ticket Closed");
    private final String description;

    ActionTypeEnum(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
