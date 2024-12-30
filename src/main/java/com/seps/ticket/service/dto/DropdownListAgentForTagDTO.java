package com.seps.ticket.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;


@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class DropdownListAgentForTagDTO {

    private Long id;
    private String name;
    private String email;

}
