package com.seps.ticket.enums;

public enum ActionTypeEnum {

    CLAIM_TICKET_ADD("Claim Ticket Add"),
    CLAIM_TICKET_EXTEND_SLA_DATE("Claim Ticket Extend SLA date"),
    CLAIM_TICKET_CLOSED("Claim Ticket Closed"),
    CLAIM_TICKET_PRIORITY_CHANGE("Claim Ticket Priority Changed"),
    CLAIM_TICKET_REJECTED("Claim Ticket Rejected"),
    CLAIM_TICKET_SECOND_INSTANCE("Claim Ticket Second Instance"),
    CLAIM_TICKET_COMPLAINT("Claim Ticket Complaint"),
    CLAIM_TICKET_WORK_FLOW_ADD("Claim Ticket Work Flow Add"),
    CLAIM_TICKET_WORK_FLOW_EDIT("Claim Ticket Work Flow Edit"),
    CLAIM_TICKET_CHANGED_STATUS("Claim Ticket Status Changed");

    private final String description;

    ActionTypeEnum(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
