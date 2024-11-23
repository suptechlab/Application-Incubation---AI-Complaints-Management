package com.seps.admin.web.rest.v1;

import com.seps.admin.aop.permission.PermissionCheck;
import com.seps.admin.enums.TeamEntityTypeEnum;
import com.seps.admin.service.TeamService;
import com.seps.admin.service.dto.*;
import com.seps.admin.service.dto.ResponseStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;

import static com.seps.admin.component.CommonHelper.convertEntityToMap;

@Tag(name = "Team Management", description = "APIs for managing teams, members, and their statuses.")
@RestController
@RequestMapping("/api/v1/teams")
public class TeamResource {

    private final Logger log = LoggerFactory.getLogger(TeamResource.class);

    private final TeamService teamService;
    private final MessageSource messageSource;

    public TeamResource(TeamService teamService, MessageSource messageSource) {
        this.teamService = teamService;
        this.messageSource = messageSource;
    }

    @Operation(summary = "Create a new team", description = "Creates a new team with the provided details.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Team created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data", content = @Content(schema = @Schema(implementation = ResponseStatus.class)))
    })
    @PostMapping
    @PermissionCheck({"TEAMS_CREATE_BY_SEPS","TEAMS_CREATE_BY_FI"})
    public ResponseEntity<ResponseStatus> createTeam(@Valid @RequestBody TeamDTO teamDTO, HttpServletRequest request) throws URISyntaxException {
        log.debug("REST request to create Team : {}", teamDTO);
        RequestInfo requestInfo = new RequestInfo(request);
        Long id = teamService.createTeam(teamDTO);
        teamService.createTeamLog(id,teamDTO,requestInfo);
        com.seps.admin.service.dto.ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("team.created.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.CREATED.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.created(new URI("/api/v1/teams/" + id))
            .body(responseStatus);
    }

    @Operation(summary = "Update an existing team", description = "Updates a team's details based on the provided ID and data.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Team updated successfully"),
        @ApiResponse(responseCode = "404", description = "Team not found", content = @Content(schema = @Schema(implementation = ResponseStatus.class)))
    })
    @PutMapping("/{id}")
    @PermissionCheck({"TEAMS_UPDATED_BY_SEPS","TEAMS_UPDATED_BY_FI"})
    public ResponseEntity<ResponseStatus> updateTeam(@Valid @PathVariable Long id, @RequestBody TeamDTO teamDTO, HttpServletRequest request) {
        log.debug("REST request to update Team : {}", teamDTO);
        RequestInfo requestInfo = new RequestInfo(request);
        Map<String, Object> oldData = convertEntityToMap(teamService.findOne(id));
        teamService.updateTeam(id, teamDTO);
        teamService.updateTeamLog(oldData,id,teamDTO,requestInfo);
        com.seps.admin.service.dto.ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("team.updated.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

    @Operation(summary = "Get a team by ID", description = "Fetches details of a specific team based on the provided ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Team details retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Team not found", content = @Content(schema = @Schema(implementation = ResponseStatus.class)))
    })
    @GetMapping("/{id}")
    @PermissionCheck({"TEAMS_UPDATED_BY_SEPS","TEAMS_UPDATED_BY_FI"})
    public ResponseEntity<TeamDTO> getRole(@PathVariable Long id) {
        log.debug("REST request to get team : {}", id);
        return ResponseEntity.ok(teamService.findOne(id));
    }

    @Operation(summary = "Get all team members by entity type", description = "Fetches a list of all members for the specified entity type.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "List of members retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid entity type provided")
    })
    @GetMapping("/members/{entityType}")
    @PermissionCheck({"TEAMS_CREATE_BY_SEPS","TEAMS_CREATE_BY_FI","TEAMS_UPDATED_BY_SEPS","TEAMS_UPDATED_BY_FI"})
    public ResponseEntity<List<TeamDTO.MemberDropdownDTO>> getAllMember(@Valid @PathVariable TeamEntityTypeEnum entityType) {
        log.debug("REST request to get all Members");
        List<TeamDTO.MemberDropdownDTO> members = teamService.findAllMembers(entityType);
        return ResponseEntity.ok(members);
    }

    @Operation(summary = "Assign members to a team", description = "Assigns one or more members to a specified team.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Members assigned successfully"),
        @ApiResponse(responseCode = "404", description = "Team not found")
    })
    @PostMapping("/{teamId}/assign-members")
    @PermissionCheck({"TEAMS_UPDATED_BY_SEPS","TEAMS_UPDATED_BY_FI"})
    public ResponseEntity<Void> assignMembersToTeam(
        @PathVariable Long teamId,
        @RequestBody @Valid AssignMembersRequestDTO assignMembersRequestDTO,
        HttpServletRequest request
    ) {
        RequestInfo requestInfo = new RequestInfo(request);
        Map<String, Object> oldData = convertEntityToMap(teamService.findOne(teamId));
        List<Long> userAssignList = teamService.assignMembersToTeam(teamId, assignMembersRequestDTO);
        teamService.assignMembersToTeamLoad(oldData, teamId,userAssignList,assignMembersRequestDTO,requestInfo);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Unassign a member from a team", description = "Removes a member from a specific team.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Member unassigned successfully"),
        @ApiResponse(responseCode = "404", description = "Team or member not found")
    })
    @DeleteMapping("/{teamId}/unassign-member/{userId}")
    @PermissionCheck({"TEAMS_UPDATED_BY_SEPS","TEAMS_UPDATED_BY_FI"})
    public ResponseEntity<Void> unassignMemberFromTeam(
        @PathVariable Long teamId,
        @PathVariable Long userId,
        HttpServletRequest request
    ) {
        RequestInfo requestInfo = new RequestInfo(request);
        Map<String, Object> oldData = convertEntityToMap(teamService.findOne(teamId));
        teamService.unassignMemberFromTeam(teamId, userId);
        teamService.unassignMemberFromTeamLoad(oldData, teamId, userId,requestInfo);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Change team status", description = "Changes the status of a specific team.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Team status changed successfully"),
        @ApiResponse(responseCode = "404", description = "Team not found")
    })
    @PatchMapping("/{id}/status")
    @PermissionCheck({"TEAMS_CHANGE_STATUS_BY_SEPS","TEAMS_CHANGE_STATUS_BY_FI"})
    public ResponseEntity<Void> teamChangeStatus(@PathVariable Long id, @RequestParam Boolean status, HttpServletRequest request) {
        RequestInfo requestInfo = new RequestInfo(request);
        teamService.changeStatus(id, status, requestInfo);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "List all Teams", description = "Retrieve a list of all teams with optional search and status filters.")
    @ApiResponse(responseCode = "200", description = "Teams retrieved successfully",
        content = @Content(mediaType = "application/json",
            schema = @Schema(implementation = ProvinceDTO.class)))
    @GetMapping
    @PermissionCheck({"TEAMS_CREATE_BY_SEPS","TEAMS_CREATE_BY_FI","TEAMS_UPDATED_BY_SEPS","TEAMS_UPDATED_BY_FI","TEAMS_CHANGE_STATUS_BY_SEPS","TEAMS_CHANGE_STATUS_BY_FI"})
    public ResponseEntity<List<TeamListDTO>> listTeams(Pageable pageable,
                                                           @RequestParam(value = "search", required = false) String search,
                                                           @Parameter(description = "Filter by status (true for active, false for inactive)") @RequestParam(required = false) Boolean status) {
        Page<TeamListDTO> page = teamService.listTeams(pageable, search, status);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
