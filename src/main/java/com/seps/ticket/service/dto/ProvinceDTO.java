package com.seps.ticket.service.dto;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class ProvinceDTO {
    private Long id;
    private String name;
    private Boolean status;
}

