package com.seps.admin.validation;

import com.seps.admin.enums.TeamEntityTypeEnum;
import com.seps.admin.service.dto.TeamDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class EntityIdValidator implements ConstraintValidator<ValidEntityId, TeamDTO> {

    @Override
    public boolean isValid(TeamDTO teamDTO, ConstraintValidatorContext context) {
        // Check if entityType is FI and entityId is null
        return teamDTO.getEntityType() != TeamEntityTypeEnum.FI || teamDTO.getEntityId() != null;
    }
}
