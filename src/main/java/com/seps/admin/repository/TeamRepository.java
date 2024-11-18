package com.seps.admin.repository;

import com.seps.admin.domain.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

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

}
