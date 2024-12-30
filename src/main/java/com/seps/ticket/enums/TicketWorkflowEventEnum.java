package com.seps.ticket.enums;

import com.seps.ticket.component.EnumWithDescription;

public enum TicketWorkflowEventEnum implements EnumWithDescription {

    CREATED("enum.ticket.workflow.created"),
    TICKET_STATUS("enum.ticket.workflow.ticket.status"),
    TICKET_PRIORITY("enum.ticket.workflow.ticket.priority"),
    SLA_DAYS_REMINDER("enum.ticket.workflow.sla.days.reminder"),
    SLA_BREACH("enum.ticket.workflow.sla.breach"),
    TICKET_DATE_EXTENSION("enum.ticket.workflow.ticket.date.extension");

    private final String key;

    TicketWorkflowEventEnum(String key) {
        this.key = key;
    }

    @Override
    public String getDescription() {
        return this.key;
    }

}
