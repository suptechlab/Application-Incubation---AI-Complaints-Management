package com.seps.ticket.service.dto.workflow;

import com.seps.ticket.enums.CreateActionEnum;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAction {
    @NotNull
    private CreateActionEnum action;
    private Long teamId;
    private Long agentId;
    private Long templateId;
}
