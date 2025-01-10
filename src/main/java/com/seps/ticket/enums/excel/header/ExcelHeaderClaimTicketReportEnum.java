package com.seps.ticket.enums.excel.header;

import com.seps.ticket.component.EnumWithDescription;

public enum ExcelHeaderClaimTicketReportEnum implements EnumWithDescription {
    ID("excel.header.id"),
    TICKET_ID("excel.header.ticketId"),
    PROVINCE("excel.header.province"),
    CITY("excel.header.city"),
    FI_ENTITY("excel.header.fiEntity"),
    CLAIM_TYPE("excel.header.claimType"),
    CLAIM_SUB_TYPE("excel.header.claimSubType"),
    PRIORITY_CARE_GROUP("excel.header.priorityCareGroup"),
    CUSTOMER_TYPE("excel.header.customerType"),
    PRIORITY("excel.header.priority"),
    SLA_DATE("excel.header.slaDate"),
    SLA_BREACH_DAYS("excel.header.slaBreachDays"),
    FI_AGENT("excel.header.fiAgent"),
    ASSIGNED_AT("excel.header.assignedAt"),
    INSTANCE_TYPE("excel.header.instanceType"),
    STATUS("excel.header.status"),
    CUSTOMER_NAME("excel.header.customerName"),
    CLOSED_STATUS("excel.header.closedStatus"),
    REJECTED_STATUS("excel.header.rejectedStatus"),
    RESOLVED_ON("excel.header.resolvedOn"),
    CREATED_BY_USER("excel.header.createdByUser"),
    CREATED_AT("excel.header.createdAt"),
    SEPS_AGENT("excel.header.sepsAgent"),
    COMPLAINT_PRECEDENTS("excel.header.complaintPrecedents"),
    COMPLAINT_SPECIFIC_PETITION("excel.header.complaintSpecificPetition"),
    SOURCE("excel.header.source"),
    CHANNEL_OF_ENTRY("excel.header.channelOfEntry"),
    SECOND_INSTANCE_COMMENT("excel.header.second.instance.comment"),
    //COMPLAINT_CREATED_AT("excel.header.complaintCreatedAt")
    ;

    private final String key;

    ExcelHeaderClaimTicketReportEnum(String key) {
        this.key = key;
    }

    @Override
    public String getDescription() {
        return this.key;
    }
}
