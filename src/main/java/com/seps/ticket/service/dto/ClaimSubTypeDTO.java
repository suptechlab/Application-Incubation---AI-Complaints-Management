package com.seps.ticket.service.dto;

import lombok.Data;

@Data
public class ClaimSubTypeDTO {
    private Long id;
    private String name;
    private Long claimTypeId;
    private String claimTypeName;
    private Integer slaBreachDays;
    private Boolean status;
}

