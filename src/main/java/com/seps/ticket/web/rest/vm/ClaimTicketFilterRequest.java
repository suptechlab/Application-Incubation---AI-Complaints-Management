package com.seps.ticket.web.rest.vm;

import com.seps.ticket.enums.*;
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
    private InstanceTypeEnum instanceType;
    private Long fiAgentId;
    private Long sepsAgentId;
    private Long claimSubTypeId;
    private Long provinceId;
    private Long cityId;
    private PriorityCareGroupEnum priorityCareGroup;
    private CustomerTypeEnum customerType;
    private ClosedStatusEnum closedStatus;
    private RejectedStatusEnum rejectedStatus;
    private SourceEnum source;
    private ChannelOfEntryEnum channelOfEntry;
    private SlaComplianceEnum slaCompliance;
}

