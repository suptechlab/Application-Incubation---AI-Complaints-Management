package com.seps.ticket.aop.permission;

import com.seps.ticket.domain.User;
import com.seps.ticket.repository.UserRepository;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Aspect
@Component
public class ActiveUserAspect {

    private final UserRepository userRepository;

    public ActiveUserAspect(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Pointcut for all methods inside @RestController that are not public APIs
    @Pointcut("within(@org.springframework.web.bind.annotation.RestController *) && !within(com.seps.ticket.web.rest.PublicController)")
    public void restControllerMethods() {
        // Pointcut for all REST controllers except public APIs
    }

    @Before("restControllerMethods()")
    public void checkUserActiveStatus(JoinPoint joinPoint) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return; // Skip check if user is not authenticated
        }

        boolean isActive = userRepository.findOneByLogin(authentication.getName())
            .map(User::isActivated)
            .orElse(false); // Default to false if user not found

        if (!isActive) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "La cuenta de usuario no está activa.");
        }
    }
}
