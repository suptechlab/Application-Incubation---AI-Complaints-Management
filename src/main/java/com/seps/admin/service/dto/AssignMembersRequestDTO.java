package com.seps.admin.service.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class AssignMembersRequestDTO {
    @NotEmpty
    private List<Long> userIds;
}
