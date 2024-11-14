package com.seps.auth.repository;

import com.seps.auth.domain.Authority;
import com.seps.auth.domain.User;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import com.seps.auth.enums.UserStatusEnum;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the {@link User} entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findOneByActivationKey(String activationKey);

    List<User> findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(Instant dateTime);

    Optional<User> findOneByResetKey(String resetKey);

    Optional<User> findOneByEmailIgnoreCase(String email);

    Optional<User> findOneByLogin(String login);

    @EntityGraph(attributePaths = "authorities")
    Optional<User> findOneWithAuthoritiesByLogin(String login);

    @EntityGraph(attributePaths = "authorities")
    Optional<User> findOneWithAuthoritiesByEmailIgnoreCase(String email);

    Page<User> findAllByIdNotNullAndActivatedIsTrue(Pageable pageable);

    /**
     * Finds a user by their OTP token.
     *
     * @param otpToken the OTP token to search for
     * @return an Optional containing the user if found, or empty if no user has the given OTP token
     */
    @EntityGraph(attributePaths = "authorities")
    Optional<User> findByOtpToken(String otpToken);

    /**
     * Finds a user by their OTP token.
     *
     * @param otpCode the OTP token to search for
     * @return an Optional containing the user if found, or empty if no user has the given OTP code
     */
    Optional<User> findByOtpCode(String otpCode);

    // Check if a user exists with the given identificacion, authorities
    Optional<User> findOneByIdentificacionAndAuthoritiesIn(String identificacion, Set<Authority> authorities );

}
