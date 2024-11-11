package com.seps.admin.service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProvinceDTO {

    private Long id;

    @NotBlank
    private String name;

    private Boolean status;
}

