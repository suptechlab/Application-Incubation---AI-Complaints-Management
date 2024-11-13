package com.seps.admin.service.dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class TemplateMasterDTO {

    private Long id;
    private String templateKey;
    private String templateName;
    private String templateType;
    private String subject;
    private String content;
    private String supportedVariables;
    private Boolean status;
}
