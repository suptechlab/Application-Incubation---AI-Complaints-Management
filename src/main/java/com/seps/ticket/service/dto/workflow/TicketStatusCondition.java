package com.seps.ticket.service.dto.workflow;

import com.seps.ticket.enums.ClaimTicketStatusEnum;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketStatusCondition {

    @NotNull
    private ClaimTicketStatusEnum status;
}
