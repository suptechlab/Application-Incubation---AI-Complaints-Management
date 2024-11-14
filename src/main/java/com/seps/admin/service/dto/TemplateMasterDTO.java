package com.seps.admin.service.dto;

import com.seps.admin.enums.TemplateTypeEnum;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class TemplateMasterDTO {

    private Long id;
    private String templateKey;
    @NotEmpty
    private String templateName;
    private TemplateTypeEnum templateType;
    @NotEmpty
    private String subject;
    @NotEmpty
    private String content;
    private String supportedVariables;
    private Boolean status;
}
