package com.seps.ticket.service.dto.workflow;

import com.seps.ticket.enums.TicketPriorityActionEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketPriorityAction {
    private TicketPriorityActionEnum action;
    private Long teamId;
    private Long agentId;
    private Long templateId;
}
