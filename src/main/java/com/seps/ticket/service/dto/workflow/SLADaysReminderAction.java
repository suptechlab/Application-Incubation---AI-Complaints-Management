package com.seps.ticket.service.dto.workflow;

import com.seps.ticket.enums.SLADaysReminderActionEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SLADaysReminderAction {
    private SLADaysReminderActionEnum action;
    private Long teamId;
    private Long agentId;
    private Long templateId;
}
