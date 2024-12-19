package com.seps.ticket.service;

import com.seps.ticket.domain.User;
import com.seps.ticket.repository.UserRepository;
import com.seps.ticket.security.SecurityUtils;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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

    public List<User> getUserListByRoleSlug(Long organizationId, String roleSlug) {
        return userRepository.findAllByOrganizationIdAndRoleSlug(organizationId, roleSlug);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_NOT_FOUND, null, null));
    }

    public User findUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

}
