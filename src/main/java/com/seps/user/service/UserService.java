package com.seps.user.service;

import com.seps.user.domain.User;
import com.seps.user.repository.UserRepository;
import com.seps.user.security.SecurityUtils;
import com.seps.user.web.rest.errors.CustomException;
import com.seps.user.web.rest.errors.SepsStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    public User getCurrentUser(){
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneWithAuthoritiesByLogin)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CURRENT_USER_NOT_FOUND, null, null));
    }
}
