package com.seps.admin.service.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CityDTO {

    private Long id;

    @NotEmpty
    private String name;

    @NotNull
    private Long provinceId;

    private String provinceName;

    private Boolean status;

    private Double povertyRangeStart;

    private Double povertyRangeEnd;

    private Double ruralityRangeStart;

    private Double ruralityRangeEnd;
}
