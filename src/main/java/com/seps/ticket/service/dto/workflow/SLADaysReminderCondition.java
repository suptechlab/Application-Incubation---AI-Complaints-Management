package com.seps.ticket.service.dto.workflow;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SLADaysReminderCondition {

    @NotNull
    private Integer noOfDays;
}
