package com.seps.ticket.service.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class RoleDTO implements Serializable {
    private Long id;
    private String name;
    private String description;
    private String userType;
    private Boolean status;
}
