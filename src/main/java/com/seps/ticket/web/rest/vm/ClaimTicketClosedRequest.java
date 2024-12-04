package com.seps.ticket.web.rest.vm;

import com.seps.ticket.enums.ClosedStatusEnum;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class ClaimTicketClosedRequest {
    private ClosedStatusEnum closeSubStatus;
    @NotBlank
    private String reason;
}
