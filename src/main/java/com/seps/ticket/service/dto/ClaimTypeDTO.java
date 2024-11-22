package com.seps.ticket.service.dto;

import lombok.Data;

@Data
public class ClaimTypeDTO {
    private Long id;
    private String name;
    private Boolean status;
}
