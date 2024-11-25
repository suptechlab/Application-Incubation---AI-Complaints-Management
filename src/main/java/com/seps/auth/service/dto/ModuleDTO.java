package com.seps.auth.service.dto;

import lombok.Data;

import java.util.List;

@Data
public class ModuleDTO {

    private Long id;
    private String name;
    private String description;
    private List<PermissionDTO> permissions;

}
