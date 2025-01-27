package com.seps.ticket.service.dto;

import com.seps.ticket.enums.CustomerTypeEnum;
import com.seps.ticket.enums.PriorityCareGroupEnum;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimTicketUpdateRequest {

    @NotNull
    private PriorityCareGroupEnum priorityCareGroup;

    @NotNull
    private CustomerTypeEnum customerType;

    @NotNull
    private Long claimTypeId;

    @NotNull
    private Long claimSubTypeId;


}
