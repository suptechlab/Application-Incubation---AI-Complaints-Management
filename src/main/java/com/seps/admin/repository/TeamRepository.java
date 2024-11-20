package com.seps.admin.repository;

import com.seps.admin.domain.Team;
import com.seps.admin.enums.TeamEntityTypeEnum;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    @Query("""
        SELECT COUNT(t) > 0
        FROM Team t
        WHERE t.teamName = :teamName
          AND t.entityType = :entityType
          AND (:entityId IS NULL OR t.entityId = :entityId)
    """)
    boolean existsByTeamNameAndEntityTypeAndEntityId(@Param("teamName") String teamName,
                                                     @Param("entityType") String entityType,
                                                     @Param("entityId") Long entityId);

    @Query("""
        SELECT tm.userId
        FROM TeamMember tm
        WHERE tm.userId IN :personIds
    """)
    List<Long> findAssignedMembers(List<Long> personIds);

    boolean existsByTeamNameAndEntityTypeAndEntityIdAndIdNot(@NotBlank String teamName, String entityType, Long entityId, Long teamId);

    Optional<Team> findByIdAndEntityIdAndEntityType(Long teamId, Long entityId, String entityType);

    Optional<Team> findByIdAndEntityType(Long teamId, String entityType);

}
