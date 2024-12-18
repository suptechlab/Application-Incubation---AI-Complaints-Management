package com.seps.admin.web.rest.v1;

import com.seps.admin.service.TeamService;
import com.seps.admin.service.UserService;
import com.seps.admin.service.dto.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@Tag(name = "WorkFlow Dropdowns", description = "APIs for managing workflow dropdowns.")
@RestController
@RequestMapping("/api/v1")
public class WorkFlowResource {


    private final TeamService teamService;
    private final UserService userService;
    public WorkFlowResource(TeamService teamService, UserService userService) {
        this.teamService = teamService;
        this.userService = userService;
    }

    @GetMapping("/teams/dropdown-list-for-workflow")
    public ResponseEntity<List<DropdownListDTO>> listActiveTeamsWorkflow(@RequestParam(required = false) Long organizationId) {
        List<DropdownListDTO> teamList = teamService.listActiveTeamsForWorkFlow(organizationId);
        return ResponseEntity.ok(teamList);
    }

    @GetMapping("/teams/{teamId}/member/dropdown-list-for-workflow")
    public ResponseEntity<List<DropdownListDTO>> listActiveTeamsMembersWorkflow(@PathVariable Long teamId) {
        List<DropdownListDTO> teamList = teamService.listActiveTeamsMembersForWorkFlow(teamId);
        return ResponseEntity.ok(teamList);
    }

    @GetMapping("/agent/dropdown-list-for-workflow")
    public ResponseEntity<List<DropdownListDTO>> listActiveAgentsWorkflow(@RequestParam(required = false) Long organizationId) {
        List<DropdownListDTO> agentList = userService.listActiveAgentsForWorkFlow(organizationId);
        return ResponseEntity.ok(agentList);
    }

}
