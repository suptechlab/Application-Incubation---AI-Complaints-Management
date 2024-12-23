package com.seps.ticket.service.dto.workflow;

import com.seps.ticket.constraint.validation.TicketWorkFlowCondition;
import com.seps.ticket.enums.InstanceTypeEnum;
import com.seps.ticket.enums.TicketWorkflowEventEnum;
import com.seps.ticket.service.dto.OrganizationDTO;
import com.seps.ticket.service.dto.UserDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@TicketWorkFlowCondition
public class ClaimTicketWorkFlowDTO {

    private Long id;

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

    @Valid
    private List<TicketStatusCondition> ticketStatusConditions;

    @Valid
    private List<TicketStatusAction> ticketStatusActions;

    @Valid
    private List<TicketPriorityCondition> ticketPriorityConditions;

    @Valid
    private List<TicketPriorityAction> ticketPriorityActions;

    @Valid
    private List<SLADaysReminderCondition> slaDaysReminderConditions;

    @Valid
    private List<SLADaysReminderAction> slaDaysReminderActions;

    private List<SLABreachAction> slaBreachActions;

    private List<TicketDateExtensionAction> ticketDateExtensionActions;

    private Boolean status;

    private Long createdBy;

    private UserDTO createdByUser;

    private Instant createdAt;

    private Long updatedBy;

    private UserDTO updatedByUser;

    private Instant updatedAt;


}
