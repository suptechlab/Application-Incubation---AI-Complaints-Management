package com.seps.ticket.service;

import com.seps.ticket.domain.Authority;
import com.seps.ticket.domain.Team;
import com.seps.ticket.domain.User;
import com.seps.ticket.enums.UserStatusEnum;
import com.seps.ticket.repository.TeamMemberRepository;
import com.seps.ticket.repository.TeamRepository;
import com.seps.ticket.security.AuthoritiesConstants;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class TeamService {

    private final TeamRepository teamRepository;

    private final TeamMemberRepository teamMemberRepository;

    public TeamService(TeamRepository teamRepository, TeamMemberRepository teamMemberRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
    }

    @Transactional(readOnly = true)
    public Team findActiveTeam(Long id) {
        return teamRepository.findOneByIdAndStatus(id, true)
            .orElse(null);
    }

}
