package com.seps.admin.service.dto;

import com.seps.admin.enums.TeamEntityTypeEnum;
import com.seps.admin.validation.ValidEntityId;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
@ValidEntityId
public class TeamDTO {
    private Long id;
    @NotBlank
    private String teamName;
    @NotBlank
    private String description;
    private Long entityId;
    private TeamEntityTypeEnum entityType = TeamEntityTypeEnum.SEPS;
    private List<Long> teamMembers;


}
