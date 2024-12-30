package com.seps.ticket.service.dto.workflow;

import com.seps.ticket.enums.TicketStatusActionEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketStatusAction {
    private TicketStatusActionEnum action;
    private Long teamId;
    private Long agentId;
    private Long templateId;
}
