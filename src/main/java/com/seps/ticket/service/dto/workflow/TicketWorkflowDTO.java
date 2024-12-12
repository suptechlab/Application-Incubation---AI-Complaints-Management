package com.seps.ticket.service.dto.workflow;

import com.seps.ticket.constraint.validation.TicketWorkFlowCondition;
import com.seps.ticket.enums.InstanceTypeEnum;
import com.seps.ticket.enums.TicketWorkflowEventEnum;
import com.seps.ticket.service.dto.OrganizationDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@TicketWorkFlowCondition
public class TicketWorkflowDTO {

    private Long id;

    @NotNull
    private Long organizationId;

    private OrganizationDTO organization;

    @NotNull
    private InstanceTypeEnum instanceType;

    @NotBlank
    @Size(max = 254)
    private String title;

    @NotBlank
    @Size(max = 1024)
    private String description;

    @NotNull
    private TicketWorkflowEventEnum event;

    @Valid
    private List<CreateCondition> createConditions;

    @Valid
    private List<CreateAction> createActions;

    private List<TicketStatusCondition> ticketStatusConditions;

    private List<TicketStatusAction> ticketStatusActions;

    private List<TicketPriorityCondition> ticketPriorityConditions;

    private List<TicketPriorityAction> ticketPriorityActions;

    private List<SLADaysReminderCondition> slaDaysReminderConditions;

    private List<SLADaysReminderAction> slaDaysReminderActions;

    private List<SLABreachAction> slaBreachActions;

    private List<TicketDateExtensionAction> ticketDateExtensionActions;

}
