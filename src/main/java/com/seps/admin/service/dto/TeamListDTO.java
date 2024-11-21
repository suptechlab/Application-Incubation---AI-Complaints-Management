package com.seps.admin.service.dto;

import com.seps.admin.validation.ValidEntityId;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@ValidEntityId
public class TeamListDTO {
    private Long id;
    @NotBlank
    private String teamName;
    @NotBlank
    private String description;
    private Long entityId;
    private String entityType;
    private String createdByEmail;
    private Long updatedBy;
    private Boolean status;

}
