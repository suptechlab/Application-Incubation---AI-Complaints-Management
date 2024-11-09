package com.seps.user.service;

import com.seps.user.domain.DpaAcceptance;
import com.seps.user.repository.DpaAcceptanceRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service class for handling DPA (Data Processing Agreement) acceptance functionality.
 */
@Service
@Transactional
public class DpaAcceptanceService {

    private final DpaAcceptanceRepository dpaAcceptanceRepository;
    private final UserService userService;

    /**
     * Constructor for DpaAcceptanceService.
     *
     * @param dpaAcceptanceRepository the repository for DPA acceptance data.
     * @param userService the service for retrieving user information.
     */
    public DpaAcceptanceService(DpaAcceptanceRepository dpaAcceptanceRepository, UserService userService) {
        this.dpaAcceptanceRepository = dpaAcceptanceRepository;
        this.userService = userService;
    }

    /**
     * Records the acceptance or decline of the Data Processing Agreement (DPA) by the user.
     *
     * @param status  the acceptance status (true if the user accepts the DPA, false if declined).
     * @param request the HTTP servlet request containing client request information.
     */
    public void acceptDpa(Boolean status, HttpServletRequest request) {
        // Create a new DpaAcceptance entity
        DpaAcceptance dpaAcceptance = new DpaAcceptance();

        // Set the user ID (retrieved from the current logged-in user)
        dpaAcceptance.setUserId(userService.getCurrentUserId());

        // Set the acceptance status (true or false)
        dpaAcceptance.setAccepted(status);

        // Set the client's IP address from the HTTP request
        dpaAcceptance.setIpAddress(request.getRemoteAddr());

        // Set the user agent string from the HTTP request headers
        dpaAcceptance.setUserAgent(request.getHeader("User-Agent"));

        // Save the DpaAcceptance entity in the repository
        dpaAcceptanceRepository.save(dpaAcceptance);
    }
}
