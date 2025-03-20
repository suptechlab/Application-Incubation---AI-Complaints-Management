package com.seps.ticket.enums.excel.header;

import com.seps.ticket.component.EnumWithDescription;

public enum ExcelHeaderSlaComplianceReportEnum implements EnumWithDescription {
    ID("excel.header.id"),
    TICKET_ID("excel.header.ticketId"),
    CLAIM_TYPE("excel.header.claimType"),
    CLAIM_SUB_TYPE("excel.header.claimSubType"),
    PROVINCE("excel.header.province"),
    CITY("excel.header.city"),
    PRIORITY("excel.header.priority"),
    INSTANCE_TYPE("excel.header.instanceType"),
    SLA_DATE("excel.header.slaDate"),
    SLA_BREACH_DAYS("excel.header.slaBreachDays"),
    SLA_DURATION_IN_DAYS("excel.header.sla.duration.in.days"),
    //ACTUAL_RESOLUTION_DAYS("excel.header.actual.resolution.days"),
    //SLA_COMPLIANCE("excel.header.sla.compliance"),
    //SLA_BREACH_REASON("excel.header.sla.breach.reason"),
    STATUS("excel.header.status"),
    CLOSED_STATUS("excel.header.closedStatus"),
    CUSTOMER_NAME("excel.header.customerName"),
    RESOLVED_ON("excel.header.resolvedOn"),
    CREATED_AT("excel.header.createdAt"),
    FI_ENTITY("excel.header.fiEntity"),
    FI_AGENT("excel.header.fiAgent"),
    SEPS_AGENT("excel.header.sepsAgent"),
    SOURCE("excel.header.source"),
    CHANNEL_OF_ENTRY("excel.header.channelOfEntry")
    ;

    private final String key;

    ExcelHeaderSlaComplianceReportEnum(String key) {
        this.key = key;
    }

    @Override
    public String getDescription() {
        return this.key;
    }
}
