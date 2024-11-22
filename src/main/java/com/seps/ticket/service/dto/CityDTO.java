package com.seps.ticket.service.dto;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class CityDTO {
    private Long id;
    private String name;
    private Long provinceId;
    private String provinceName;
    private Boolean status;
}
