package com.seps.admin.service.dto;

import com.seps.admin.domain.Role;
import com.seps.admin.enums.TeamEntityTypeEnum;
import com.seps.admin.validation.ValidEntityId;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.util.List;
import java.util.Set;

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
    private List<MemberDTO> members;
    private Long createdBy;
    private String createdByEmail;
    private Instant createdAt;
    private Long updatedBy;
    private String updatedByEmail;
    private Boolean status;

    @Data
    public static class MemberDTO implements Serializable {

        @Serial
        private static final long serialVersionUID = 1L;

        private Long id;      // TeamMember ID from `team_members` table
        private Long userId;  // User ID
        private String name;  // User name
        private String email;  // User email
        private Long assignedBy;
        private String assignedByEmail;  // User assigned by (email)
        private String role; // Ensure User.getRoles() provides a comma separate roles

    }

    @Data
    public static class MemberDropdownDTO implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private Long id;       // User ID
        private String name;   // User name
        private String role; // Ensure User.getRoles() provides a comma separate roles
    }


}
