package com.seps.ticket.service.projection;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class SlaAdherenceDataDTO {
    private Long slaOnTimeCount;
    private Long slaBreachedCount;
}
