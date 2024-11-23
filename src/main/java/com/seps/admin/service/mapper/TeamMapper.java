package com.seps.admin.service.mapper;

import com.seps.admin.domain.Role;
import com.seps.admin.domain.Team;
import com.seps.admin.domain.TeamMember;
import com.seps.admin.service.dto.TeamDTO;
import com.seps.admin.service.dto.TeamListDTO;
import java.util.Collections;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface TeamMapper {

    @Mapping(source = "teamMembers", target = "teamMembers", qualifiedByName = "mapTeamMemberIds")
    @Mapping(source = "teamMembers", target = "members", qualifiedByName = "mapTeamMembersToDTOs")
    @Mapping(source = "createdByUser.email", target = "createdByEmail")
    @Mapping(source = "updatedByUser.email", target = "updatedByEmail")
    TeamDTO toTeamDTO(Team team);

    @Named("mapTeamMemberIds")
    default List<Long> mapTeamMemberIds(List<TeamMember> teamMembers) {
        if (teamMembers == null) {
            return null;
        }
        return teamMembers.stream()
            .map(TeamMember::getId)
            .toList();
    }

    @Named("mapTeamMembersToDTOs")
    default List<TeamDTO.MemberDTO> mapTeamMembersToDTOs(List<TeamMember> teamMembers) {
        if (teamMembers == null) {
            return Collections.emptyList();
        }
        return teamMembers.stream().map(teamMember -> {
            TeamDTO.MemberDTO memberDTO = new TeamDTO.MemberDTO();
            memberDTO.setId(teamMember.getId()); // TeamMember ID
            memberDTO.setUserId(teamMember.getUserId()); // User ID
            memberDTO.setName(teamMember.getUser().getFirstName()); // User name
            memberDTO.setEmail(teamMember.getUser().getEmail()); // User email
            memberDTO.setAssignedBy(teamMember.getAssignedBy()); // Assigned by ID
            memberDTO.setAssignedByEmail(
                teamMember.getAssigned() != null ? teamMember.getAssigned().getEmail() : null
            ); // Assigned by email
            String roles = teamMember.getUser().getRoles().stream().map(Role::getName).collect(Collectors.joining(", "));
            memberDTO.setRole(roles);
            return memberDTO;
        }).toList();
    }

    @Mapping(source = "createdByUser.email", target = "createdByEmail")
    TeamListDTO toTeamListDTO(Team team);
}
