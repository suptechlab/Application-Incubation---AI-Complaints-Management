package com.seps.ticket.enums.excel.header;

import com.seps.ticket.component.EnumWithDescription;

public enum ExcelHeaderClaimTicketEnum implements EnumWithDescription {
    ID("excel.header.id"),
    TICKET_ID("excel.header.ticketId"),
    CREATED_AT("excel.header.createdAt"),
    CUSTOMER_NAME("excel.header.customerName"),
    CLAIM_TYPE("excel.header.claimType"),
    CLAIM_SUB_TYPE("excel.header.claimSubType"),
    CLAIM_AMOUNT("excel.header.claim.amount"),
    //FI_ENTITY("excel.header.fiEntity"),
    SLA_DATE("excel.header.slaDate"),
    STATUS("excel.header.status"),
    FI_AGENT("excel.header.fiAgent"),

    INSTANCE_TYPE("excel.header.instanceType"),
    //SECOND_INSTANCE_CREATED_AT("excel.header.secondInstanceCreatedAt"),
    //COMPLAINT_CREATED_AT("excel.header.complaintCreatedAt"),
    ;

    private final String key;

    ExcelHeaderClaimTicketEnum(String key) {
        this.key = key;
    }

    @Override
    public String getDescription() {
        return this.key;
    }
}
