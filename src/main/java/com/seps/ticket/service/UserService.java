package com.seps.ticket.service;

import com.seps.ticket.domain.Authority;
import com.seps.ticket.domain.User;
import com.seps.ticket.enums.UserStatusEnum;
import com.seps.ticket.repository.AuthorityRepository;
import com.seps.ticket.repository.UserRepository;
import com.seps.ticket.security.AuthoritiesConstants;
import com.seps.ticket.security.SecurityUtils;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final AuthorityRepository authorityRepository;

    public UserService(UserRepository userRepository, AuthorityRepository authorityRepository) {
        this.userRepository = userRepository;
        this.authorityRepository = authorityRepository;
    }

    @Transactional
    public User getCurrentUser() {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneWithAuthoritiesByLogin)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CURRENT_USER_NOT_FOUND, null, null));
    }

    public Long getCurrentUserId() {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneWithAuthoritiesByLogin)
            .map(User::getId)
            .orElse(null);
    }

    public List<User> getUserListByRoleSlug(String roleSlug) {
        return userRepository.findAllByRoleSlug(roleSlug);
    }

    public List<User> getUserListBySepsUser() {
        String userRole = AuthoritiesConstants.SEPS;
        return userRepository.findUsersSEPSByRole(userRole);
    }

    public List<User> getUserListByRoleSlug(Long organizationId, String roleSlug) {
        return userRepository.findAllByOrganizationIdAndRoleSlug(organizationId, roleSlug);
    }

    public List<User> getUserListByOrganizationIdFI(Long organizationId) {
        String userRole = AuthoritiesConstants.FI;
        return userRepository.findUsersFIByRole(organizationId, userRole);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_NOT_FOUND, null, null));
    }

    @Transactional
    public User findUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public User findActiveFIUser(Long id, Long organizationId) {
        Set<Authority> authorities = new HashSet<>();
        authorityRepository.findById(AuthoritiesConstants.FI).ifPresent(authorities::add);
        Set<UserStatusEnum> statuses = Set.of(UserStatusEnum.ACTIVE);
        return userRepository.findOneByIdAndOrganizationIdAndAuthoritiesInAndStatusIn(id, organizationId, authorities, statuses)
            .orElse(null);
    }

    @Transactional(readOnly = true)
    public User findActiveSEPSUser(Long id) {
        Set<Authority> authorities = new HashSet<>();
        authorityRepository.findById(AuthoritiesConstants.SEPS).ifPresent(authorities::add);
        Set<UserStatusEnum> statuses = Set.of(UserStatusEnum.ACTIVE);
        return userRepository.findOneByIdAndAuthoritiesInAndStatusIn(id, authorities, statuses)
            .orElse(null);
    }

    @Transactional(readOnly = true)
    public User findActiveUser(Long id) {
        Set<UserStatusEnum> statuses = Set.of(UserStatusEnum.ACTIVE);
        return userRepository.findOneByIdAndStatusIn(id, statuses)
            .orElse(null);
    }

    @Transactional(readOnly = true)
    public User findActiveSEPSOrFIUser(Long id) {
        Set<Authority> authorities = new HashSet<>();
        authorityRepository.findById(AuthoritiesConstants.SEPS).ifPresent(authorities::add);
        authorityRepository.findById(AuthoritiesConstants.FI).ifPresent(authorities::add);
        Set<UserStatusEnum> statuses = Set.of(UserStatusEnum.ACTIVE);
        return userRepository.findOneByIdAndAuthoritiesInAndStatusIn(id, authorities, statuses)
            .orElse(null);
    }


}
