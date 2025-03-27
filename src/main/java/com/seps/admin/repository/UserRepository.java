package com.seps.admin.repository;

import com.seps.admin.domain.Authority;
import com.seps.admin.domain.Role;
import com.seps.admin.domain.User;
import com.seps.admin.enums.UserStatusEnum;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Spring Data JPA repository for the {@link User} entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findOneByEmailIgnoreCase(String email);

    Optional<User> findOneByLogin(String login);

    @EntityGraph(attributePaths = "authorities")
    Optional<User> findOneWithAuthoritiesByLogin(String login);

    @EntityGraph(attributePaths = "authorities")
    Optional<User> findOneWithAuthoritiesByEmailIgnoreCase(String email);

    @EntityGraph(attributePaths = "authorities")
    Optional<User> findOneWithAuthoritiesById(Long id);

    // Check if a user exists with the given identificacion, authorities, and status
    Optional<User> findOneByIdentificacionAndOrganizationIdAndAuthoritiesInAndStatusIn(
        String identificacion, Long organizationId, Set<Authority> authorities, Set<UserStatusEnum> statuses
    );

    @Query("SELECT u.id FROM User u JOIN u.authorities a WHERE a.name = :role")
    List<Long> findValidPersonIdsByUserRole(@Param("role") String role);

    @Query("""
        SELECT u
        FROM User u
        JOIN u.authorities a
        WHERE u.id NOT IN (
            SELECT tm.user.id
            FROM TeamMember tm
        )
        AND (COALESCE(:organizationId, NULL) IS NULL OR u.organizationId = :organizationId)
        AND a.name = :role
        AND u.activated = true
    """)
    List<User> findUsersNotAssignedToTeamByRole(@Param("role") String role, @Param("organizationId") Long organizationId);

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r = :role")
    long countUsersByRole(@Param("role") Role role);
}
