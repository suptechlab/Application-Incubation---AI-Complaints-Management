package com.seps.auth.web.rest;

import static com.seps.auth.security.SecurityUtils.AUTHORITIES_KEY;
import static com.seps.auth.security.SecurityUtils.JWT_ALGORITHM;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.seps.auth.service.MailService;
import com.seps.auth.service.OtpService;
import com.seps.auth.service.RecaptchaService;
import com.seps.auth.service.UserService;
import com.seps.auth.service.dto.OTPResponse;
import com.seps.auth.web.rest.errors.CustomException;
import com.seps.auth.web.rest.errors.SepsStatusCode;
import com.seps.auth.web.rest.vm.LoginVM;
import jakarta.validation.Valid;

import java.io.IOException;
import java.security.Principal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;

import liquibase.exception.CustomChangeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.*;
import org.zalando.problem.Status;

/**
 * Controller to authenticate users.
 */
@RestController
@RequestMapping("/api")
public class AuthenticateController {

    private static final Logger LOG = LoggerFactory.getLogger(AuthenticateController.class);

    private final JwtEncoder jwtEncoder;

    @Value("${jhipster.security.authentication.jwt.token-validity-in-seconds:0}")
    private long tokenValidityInSeconds;

    @Value("${jhipster.security.authentication.jwt.token-validity-in-seconds-for-remember-me:0}")
    private long tokenValidityInSecondsForRememberMe;

    private final AuthenticationManagerBuilder authenticationManagerBuilder;

    private final RecaptchaService recaptchaService;

    private final UserService userService;

    private final MailService mailService;

    public AuthenticateController(JwtEncoder jwtEncoder, AuthenticationManagerBuilder authenticationManagerBuilder, RecaptchaService recaptchaService, UserService userService, MailService mailService) {
        this.jwtEncoder = jwtEncoder;
        this.authenticationManagerBuilder = authenticationManagerBuilder;
        this.recaptchaService = recaptchaService;
        this.userService = userService;
        this.mailService = mailService;
    }

    @PostMapping("/authenticate")
    public ResponseEntity<JWTToken> authorize(@Valid @RequestBody LoginVM loginVM) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
            loginVM.getUsername(),
            loginVM.getPassword()
        );

        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = this.createToken(authentication, loginVM.isRememberMe());
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setBearerAuth(jwt);
        return new ResponseEntity<>(new JWTToken(jwt), httpHeaders, HttpStatus.OK);
    }

    /**
     * {@code GET /authenticate} : check if the user is authenticated, and return its login.
     *
     * @param principal the authentication principal.
     * @return the login if the user is authenticated.
     */
    @GetMapping(value = "/authenticate", produces = MediaType.TEXT_PLAIN_VALUE)
    public String isAuthenticated(Principal principal) {
        LOG.debug("REST request to check if the current user is authenticated");
        return principal == null ? null : principal.getName();
    }

    public String createToken(Authentication authentication, boolean rememberMe) {
        String authorities = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.joining(" "));
        Instant now = Instant.now();
        Instant validity;
        if (rememberMe) {
            validity = now.plus(this.tokenValidityInSecondsForRememberMe, ChronoUnit.SECONDS);
        } else {
            validity = now.plus(this.tokenValidityInSeconds, ChronoUnit.SECONDS);
        }

        // @formatter:off
        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuedAt(now)
            .expiresAt(validity)
            .subject(authentication.getName())
            .claim(AUTHORITIES_KEY, authorities)
            .build();

        JwsHeader jwsHeader = JwsHeader.with(JWT_ALGORITHM).build();
        return this.jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

    @PostMapping("/login")
    public ResponseEntity<OTPResponse> login(@Valid @RequestBody LoginVM loginVM) {
        try {
            if(!recaptchaService.verifyRecaptcha(loginVM.getRecaptchaToken())){
                LOG.error("Error while verifying recaptcha token");
                throw new CustomException(Status.BAD_REQUEST,SepsStatusCode.RECAPTCHA_FAILED,null,null);
            }
        } catch (IOException e) {
            LOG.error("Error while verifying recaptcha token :{}",e.getMessage());
            throw new CustomException(Status.BAD_REQUEST,SepsStatusCode.RECAPTCHA_FAILED,null,null);
        }
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
            loginVM.getUsername(),
            loginVM.getPassword()
        );
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = this.createToken(authentication, loginVM.isRememberMe());
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setBearerAuth(jwt);
        // Generate OTP and retrieve its expiration time
        OtpService otpService = new OtpService();
        String otpCode = otpService.generateOtpCode();
        Instant otpExpirationTime = otpService.getOtpExpirationTime();
        String otpToken = otpService.generateOtpToken();
        Instant otpTokenExpirationTime = otpService.getOtpTokenExpirationTime();
        return new ResponseEntity<>(new OTPResponse(otpToken, otpTokenExpirationTime),HttpStatus.OK);
    }

    /**
     * Object to return as body in JWT Authentication.
     */
    static class JWTToken {

        private String idToken;

        JWTToken(String idToken) {
            this.idToken = idToken;
        }

        @JsonProperty("id_token")
        String getIdToken() {
            return idToken;
        }

        void setIdToken(String idToken) {
            this.idToken = idToken;
        }
    }
}
