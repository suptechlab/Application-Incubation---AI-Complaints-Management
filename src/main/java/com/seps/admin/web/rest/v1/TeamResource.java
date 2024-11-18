package com.seps.admin.web.rest.v1;

import com.seps.admin.service.TeamService;
import com.seps.admin.service.dto.RequestInfo;
import com.seps.admin.service.dto.ResponseStatus;
import com.seps.admin.service.dto.TeamDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

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


    @PostMapping
    public ResponseEntity<com.seps.admin.service.dto.ResponseStatus> createRole(@Valid @RequestBody TeamDTO teamDTO, HttpServletRequest request) throws URISyntaxException {
        log.debug("REST request to create Team : {}", teamDTO);
        RequestInfo requestInfo = new RequestInfo(request);
        Long id = teamService.createTeam(teamDTO, requestInfo);
        com.seps.admin.service.dto.ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("team.created.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.CREATED.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.created(new URI("/api/v1/teams/" + id))
            .body(responseStatus);
    }
}
