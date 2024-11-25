package com.seps.ticket.service.projection;

import com.seps.ticket.enums.ClaimTicketStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ClaimStatusCountProjection {
    private ClaimTicketStatusEnum status;
    private Long count;
}
