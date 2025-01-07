package com.seps.ticket.enums.excel.header;

import com.seps.ticket.component.EnumWithDescription;

public enum ExcelHeaderClaimTicketReportEnum implements EnumWithDescription {
    ID("excel.header.id"),
    TICKET_ID("excel.header.ticketId"),
    CLAIM_TYPE("excel.header.claimType"),
    CLAIM_SUB_TYPE("excel.header.claimSubType"),
    FI_ENTITY("excel.header.fiEntity"),
    SLA_DATE("excel.header.slaDate"),
    STATUS("excel.header.status"),
    CUSTOMER_NAME("excel.header.customerName"),
    FI_AGENT("excel.header.fiAgent"),
    SEPS_AGENT("excel.header.sepsAgent"),
    INSTANCE_TYPE("excel.header.instanceType"),
    CREATED_AT("excel.header.createdAt"),
    SECOND_INSTANCE_CREATED_AT("excel.header.secondInstanceCreatedAt"),
    COMPLAINT_CREATED_AT("excel.header.complaintCreatedAt");

    private final String key;

    ExcelHeaderClaimTicketReportEnum(String key) {
        this.key = key;
    }

    @Override
    public String getDescription() {
        return this.key;
    }
}
