package com.seps.ticket.repository;

import com.seps.ticket.domain.Authority;
import com.seps.ticket.domain.User;
import com.seps.ticket.enums.UserStatusEnum;
import com.seps.ticket.service.mapper.UserMapper;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = "authorities")
    Optional<User> findOneWithAuthoritiesByLogin(String login);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.roleSlug = :roleSlug")
    List<User> findAllByRoleSlug(String roleSlug);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.roleSlug = :roleSlug AND u.organizationId = :organizationId")
    List<User> findAllByOrganizationIdAndRoleSlug(Long organizationId, String roleSlug);

    @EntityGraph(attributePaths = "authorities")
    Optional<User> findOneByIdAndAuthoritiesInAndStatusIn(Long id, Set<Authority> authorities, Set<UserStatusEnum> statuses);

    @EntityGraph(attributePaths = "authorities")
    Optional<User> findOneByIdAndOrganizationIdAndAuthoritiesInAndStatusIn(Long id, Long organizationId, Set<Authority> authorities, Set<UserStatusEnum> statuses);

    @EntityGraph(attributePaths = "authorities")
    Optional<User> findOneByIdAndAndStatusIn(Long agentId, Set<UserStatusEnum> requiredStatuses);

    @EntityGraph(attributePaths = "authorities")
    Optional<User> findOneByIdAndStatusIn(Long id, Set<UserStatusEnum> statuses);
}
