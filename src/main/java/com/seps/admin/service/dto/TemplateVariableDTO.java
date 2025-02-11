package com.seps.admin.service.dto;

import lombok.Data;

@Data
public class TemplateVariableDTO {

    private Long id;
    private String keyword;
    private String meaning;
    private String usage;
    private Boolean isUse = false;

}
