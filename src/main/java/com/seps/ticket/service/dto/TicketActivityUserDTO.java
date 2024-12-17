package com.seps.ticket.service.dto;

import com.seps.ticket.enums.UserStatusEnum;
import lombok.Data;
import lombok.ToString;

import java.time.Instant;
import java.util.Set;

@Data
@ToString
public class TicketActivityUserDTO {
    private Long id;
    private String name;
    private String email;
    private Set<RoleDTO> roles;
}
