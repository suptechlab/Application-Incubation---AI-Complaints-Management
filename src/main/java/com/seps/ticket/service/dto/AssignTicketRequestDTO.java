package com.seps.ticket.service.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class AssignTicketRequestDTO {
    @NotEmpty
    private List<Long> ticketIds;
}
