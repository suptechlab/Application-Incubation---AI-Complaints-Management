package com.seps.ticket.web.rest.vm;

import com.seps.ticket.enums.RejectedStatusEnum;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class ClaimTicketRejectRequest {
    private RejectedStatusEnum rejectedStatus;
    @NotBlank
    private String reason;
}
