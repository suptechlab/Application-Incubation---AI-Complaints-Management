package com.seps.ticket.service.dto.workflow;

import com.seps.ticket.enums.ClaimTicketPriorityEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketPriorityCondition {

    private ClaimTicketPriorityEnum priority;
}
