package com.seps.ticket.service.dto.workflow;

import com.seps.ticket.enums.SLABreachActionEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SLABreachAction {
    private SLABreachActionEnum action;
    private Long teamId;
    private Long agentId;
    private Long templateId;
}
