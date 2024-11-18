package com.seps.user.service.dto;

import lombok.Data;

@Data
public class ClaimSubTypeDTO {

    private Long id;

    private String name;

    private String description;

    private Long claimTypeId;

    private String claimTypeName;

    private Integer slaBreachDays;

    private Boolean status;
}

