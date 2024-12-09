package com.seps.ticket.web.rest.vm;

import com.seps.ticket.enums.ClaimTicketPriorityEnum;
import com.seps.ticket.enums.ClaimTicketStatusEnum;
import lombok.Data;

@Data
public class ClaimTicketFilterRequest {
    private String search;
    private ClaimTicketStatusEnum claimTicketStatus;
    private ClaimTicketPriorityEnum claimTicketPriority;
    private String startDate;
    private String endDate;
    private Long organizationId;
    private Long claimTypeId;
}

