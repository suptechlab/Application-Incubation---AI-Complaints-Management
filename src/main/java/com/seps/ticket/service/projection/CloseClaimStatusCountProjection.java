package com.seps.ticket.service.projection;

import com.seps.ticket.enums.ClosedStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CloseClaimStatusCountProjection {
    private ClosedStatusEnum status;
    private Long count;
}
