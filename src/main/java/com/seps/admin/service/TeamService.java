package com.seps.admin.service;

import com.seps.admin.domain.Authority;
import com.seps.admin.domain.Team;
import com.seps.admin.domain.TeamMember;
import com.seps.admin.domain.User;
import com.seps.admin.enums.TeamEntityTypeEnum;
import com.seps.admin.repository.TeamMemberRepository;
import com.seps.admin.repository.TeamRepository;
import com.seps.admin.repository.UserRepository;
import com.seps.admin.security.AuthoritiesConstants;
import com.seps.admin.service.dto.OrganizationDTO;
import com.seps.admin.service.dto.RequestInfo;
import com.seps.admin.service.dto.TeamDTO;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

import java.util.List;

@Service
@Transactional
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserService userService;
    private final OrganizationService organizationService;
    private final UserRepository userRepository;

    @Autowired
    public TeamService(TeamRepository teamRepository, TeamMemberRepository teamMemberRepository, UserService userService, OrganizationService organizationService,
                       UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userService = userService;
        this.organizationService = organizationService;
        this.userRepository = userRepository;
    }

    public Long createTeam(@Valid TeamDTO teamDTO, RequestInfo requestInfo) {
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        if(authority.contains(AuthoritiesConstants.SEPS)){
            teamDTO.setEntityType(TeamEntityTypeEnum.SEPS);
        }
        if(authority.contains(AuthoritiesConstants.FI)){
            teamDTO.setEntityType(TeamEntityTypeEnum.FI);
        }

        Team team = new Team();
        if(teamDTO.getEntityType().equals(TeamEntityTypeEnum.FI)) {
            OrganizationDTO organization = organizationService.getOrganizationById(teamDTO.getEntityId());
            team.setEntityId(organization.getId());
        }

        validatePersonAssignToTeam(teamDTO.getTeamMembers(),teamDTO.getEntityType());
        validateDuplicateTeam(teamDTO);
        validateUniqueMemberAssignment(teamDTO.getTeamMembers());

        team.setTeamName(teamDTO.getTeamName());
        team.setDescription(teamDTO.getDescription());
        team.setEntityType(teamDTO.getEntityType().name());
        team.setCreatedBy(currentUser.getId());
        team.setEntityId(teamDTO.getEntityId());
        team.setStatus(true);

        Team savedTeam = teamRepository.save(team);

        if (teamDTO.getTeamMembers() != null) {
            List<TeamMember> members = teamDTO.getTeamMembers().stream().map(memberId -> {
                TeamMember member = new TeamMember();
                member.setTeam(savedTeam);
                member.setUserId(memberId);
                member.setAssignedBy(currentUser.getId());
                return member;
            }).toList();
            teamMemberRepository.saveAll(members);
        }

        return savedTeam.getId();
    }

    /**
     * Validates that the list of members assigned to thROLE_FIe team are related to the specified role type (e.g., `ROLE_FI`).
     *
     * @param personIds List of member IDs to be assigned to the team.
     * @param entityType  The user role type (e.g., `ROLE_FI`).
     * @throws CustomException if any member in the list does not belong to the specified role type.
     */
    private void validatePersonAssignToTeam(List<Long> personIds, TeamEntityTypeEnum entityType) {
        if (personIds == null || personIds.isEmpty()) {
            return; // No members to validate
        }
        String userRole = AuthoritiesConstants.SEPS;
        if(entityType.equals(TeamEntityTypeEnum.FI))
            userRole = AuthoritiesConstants.FI;

        // Fetch valid member IDs based on the specified role
        List<Long> validPersonIds = userRepository.findValidPersonIdsByUserRole(userRole);

        // Check if all provided member IDs are valid
        List<Long> invalidMembers = personIds.stream()
            .filter(personId -> !validPersonIds.contains(personId))
            .toList();

        if (!invalidMembers.isEmpty()) {
            throw new CustomException(
                Status.BAD_REQUEST,
                SepsStatusCode.INVALID_MEMBER_LIST,
                new String[]{userRole, invalidMembers.toString()},
                null
            );
        }
    }

    private void validateDuplicateTeam(TeamDTO teamDTO) {
        boolean isDuplicate = teamRepository.existsByTeamNameAndEntityTypeAndEntityId(
            teamDTO.getTeamName(),
            teamDTO.getEntityType().toString(),
            teamDTO.getEntityId()
        );

        if (isDuplicate) {
            throw new CustomException(
                Status.CONFLICT,
                SepsStatusCode.DUPLICATE_TEAM,
                new String[]{
                    teamDTO.getTeamName(),
                    teamDTO.getEntityType().getCode(),
                    teamDTO.getEntityId() != null ? teamDTO.getEntityId().toString() : "N/A"
                },
                null
            );
        }
    }

    private void validateUniqueMemberAssignment(List<Long> personIds) {
        List<Long> assignedMembers = teamRepository.findAssignedMembers(personIds);

        if (!assignedMembers.isEmpty()) {
            throw new CustomException(
                Status.BAD_REQUEST,
                SepsStatusCode.MEMBER_ALREADY_ASSIGNED,
                new String[]{assignedMembers.toString()},
                null
            );
        }
    }


}
