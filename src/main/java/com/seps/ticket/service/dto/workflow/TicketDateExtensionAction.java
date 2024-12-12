package com.seps.ticket.service.dto.workflow;

import com.seps.ticket.enums.TicketDateExtensionActionEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketDateExtensionAction {
    private TicketDateExtensionActionEnum action;
    private Long teamId;
    private Long agentId;
    private Long templateId;
}
