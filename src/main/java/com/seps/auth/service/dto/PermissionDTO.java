package com.seps.auth.service.dto;

import lombok.Data;

@Data
public class PermissionDTO {

    private Long id;
    private String name;
    private String description;
    private Boolean checked = false;

}
