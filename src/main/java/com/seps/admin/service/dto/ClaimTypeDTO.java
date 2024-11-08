package com.seps.admin.service.dto;

import lombok.Data;

@Data
public class ClaimTypeDTO {

    private Long id;

    private String name;

    private String description;

    private Boolean status;
}
