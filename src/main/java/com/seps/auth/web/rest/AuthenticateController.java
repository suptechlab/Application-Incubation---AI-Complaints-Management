package com.seps.auth.web.rest;

import static com.seps.auth.security.SecurityUtils.AUTHORITIES_KEY;
import static com.seps.auth.security.SecurityUtils.JWT_ALGORITHM;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.seps.auth.domain.LoginLog;
import com.seps.auth.domain.User;
import com.seps.auth.repository.LoginLogRepository;
import com.seps.auth.service.MailService;
import com.seps.auth.service.RecaptchaService;
import com.seps.auth.service.UserService;
import com.seps.auth.service.dto.OtpResponse;
import com.seps.auth.service.dto.ResponseStatus;
import com.seps.auth.web.rest.errors.CustomException;
import com.seps.auth.web.rest.errors.SepsStatusCode;
import com.seps.auth.web.rest.vm.LoginVM;
import com.seps.auth.web.rest.vm.OtpVerificationVM;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.io.IOException;
import java.security.Principal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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

    private final UserService userService;

    private final MailService mailService;

    private final MessageSource messageSource;


    public AuthenticateController(JwtEncoder jwtEncoder, AuthenticationManagerBuilder authenticationManagerBuilder,
                                  UserService userService, MailService mailService, MessageSource messageSource) {
        this.jwtEncoder = jwtEncoder;
        this.authenticationManagerBuilder = authenticationManagerBuilder;
        this.userService = userService;
        this.mailService = mailService;
        this.messageSource = messageSource;
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

    /**
     * Handles user login requests by verifying the recaptcha token, authenticating credentials, and sending a one-time password (OTP) via email.
     * Logs both successful and failed login attempts, capturing relevant details like the client IP address and timestamp.
     *
     * @param loginVM the login credentials and recaptcha token provided by the user.
     * @param request the HTTP request object to obtain client IP.
     * @return ResponseEntity containing an OtpResponse with the OTP token and expiration time if authentication is successful.
     * @throws CustomException if recaptcha verification fails or if authentication fails.
     */
    @PostMapping("/login")
    public ResponseEntity<OtpResponse> login(@Valid @RequestBody LoginVM loginVM, HttpServletRequest request) {
        String clientIp = request.getRemoteAddr();
        // Verify reCAPTCHA
//        if (!userService.isRecaptchaValid(loginVM.getRecaptchaToken())) {
//            LOG.error("Recaptcha verification failed for token: {}", loginVM.getRecaptchaToken());
//            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.RECAPTCHA_FAILED, null, null);
//        }
        try {
            // Authenticate user credentials
            Authentication authentication = authenticationManagerBuilder.getObject().authenticate(
                new UsernamePasswordAuthenticationToken(loginVM.getUsername(), loginVM.getPassword())
            );
            // Retrieve user, update OTP, and send via email
            User user = userService.updateUserOtpInfo(loginVM.getUsername());
            mailService.sendLoginOtpEmail(user);
            // Log the successful login attempt
            userService.saveLoginLog(user,UserService.INITIATED, clientIp);
            // Return OTP response
            return new ResponseEntity<>(new OtpResponse(user.getOtpToken(), user.getOtpTokenExpirationTime()), HttpStatus.OK);
        } catch (AuthenticationException e) {
            // Handle failed authentication, log with user ID if found
            Optional<User> optionalUser = userService.getUserWithAuthoritiesByLogin(loginVM.getUsername());
            optionalUser.ifPresent(user -> {
                userService.saveLoginLog(user,UserService.FAILED, clientIp);
            });
            LOG.error("Authentication failed for user: {}", loginVM.getUsername(), e);
            throw e;
        }
    }


    /**
     * Endpoint to verify the OTP code and token for user login and generate a JWT token upon successful verification.
     *
     * @param otpVerificationVM the view model containing the OTP code and token for verification
     * @return ResponseEntity containing the generated JWT token if verification succeeds
     * @throws CustomException if OTP token or code is invalid or if user is not found
     */
    @PostMapping("/verify-login-otp")
    public ResponseEntity<JWTToken> verifyLoginOtp(@Valid @RequestBody OtpVerificationVM otpVerificationVM,HttpServletRequest request) {
        String clientIp=request.getRemoteAddr();
        // Step 1: Verify that the OTP token is valid. If it’s invalid, log an error and throw a CustomException.
        if (!userService.verifyOtpToken(otpVerificationVM.getOtpToken())) {
            LOG.error("Invalid OTP token: {}", otpVerificationVM.getOtpToken());
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_OTP_TOKEN, null, null);
        }
        // Step 2: Verify that the OTP code matches the code associated with the OTP token.
        // If there is a mismatch, log an error and throw a CustomException.
        if (!userService.verifyOtpCode(otpVerificationVM.getOtpCode(), otpVerificationVM.getOtpToken())) {
            LOG.error("Invalid OTP code for token: {}", otpVerificationVM.getOtpToken());
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_OTP_CODE, null, null);
        }
        // Step 3: Retrieve the user associated with the provided OTP token.
        // If no user is found, throw a CustomException indicating the user was not found.
        User user = userService.findUserByOtpToken(otpVerificationVM.getOtpToken())
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_NOT_FOUND, null, null));
        // Step 4: Create a list of GrantedAuthority objects from the user's roles.
        // This list will be used to construct an authenticated UsernamePasswordAuthenticationToken.
        List<GrantedAuthority> authorities = user.getAuthorities().stream()
            .map(role -> new SimpleGrantedAuthority(role.getName()))
            .collect(Collectors.toList());
        // Step 5: Create an Authentication object using the user’s login and roles (authorities).
        // Note: Passing `null` for credentials since we are not using a password in this flow.
        UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(user.getLogin(), null, authorities);
        // Step 6: Set the authentication object in the SecurityContext.
        // This allows Spring Security to recognize the user as authenticated in the current session.
        SecurityContextHolder.getContext().setAuthentication(authentication);
        // Step 7: Generate a JWT token for the authenticated user using the createToken method.
        // The token is configured to be used with "remember me" settings if applicable.
        String jwt = this.createToken(authentication, true);
        // Step 8: Set the JWT token in HTTP headers for the response.
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setBearerAuth(jwt);
        // Step 9: Clear the OTP data from the user's record in the database for security purposes,
        // preventing the reuse of OTP tokens and codes.
        userService.clearOtpData(user);
        // Step 10: Return the JWT token within an HTTP response entity.
        // The JWT token is added to the headers and returned to the client in a successful 200 OK response.
        // Log successful login attempt
        userService.logSuccessfulLogin(user,clientIp);
        return new ResponseEntity<>(new JWTToken(jwt), httpHeaders, HttpStatus.OK);
    }

    /**
     * Resends a one-time password (OTP) to the user's email for login verification.
     *
     * This endpoint allows a user to request the OTP to be resent if the initial OTP has not been received or expired.
     *
     * @param otpToken the OTP token associated with the login session.
     * @return ResponseEntity<Void> with HTTP status 200 (OK) if the OTP email is successfully resent.
     * @throws CustomException if the OTP token is invalid or the user is not found.
     */
    @GetMapping("/resend-login-otp")
    public ResponseEntity<ResponseStatus> resendLoginOtp(@RequestParam(name = "otpToken") String otpToken){
        // Step 1: Verify that the OTP token is valid. If it’s invalid, log an error and throw a CustomException.
        if (!userService.verifyOtpToken(otpToken)) {
            LOG.error("Invalid OTP token while resending OTP : {}", otpToken);
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_OTP_TOKEN, null, null);
        }
        // Step 2: Retrieve the user associated with the OTP token. If no user is found, throw a CustomException.
        User user = userService.findUserByOtpToken(otpToken)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_NOT_FOUND, null, null));
        // Step 3: Update the OTP code and expiration for the user and resend the OTP email.
        mailService.sendLoginOtpEmail(userService.updateUserOtpCode(user));
        // Step 4: Return HTTP status 200 (OK) indicating that the OTP email has been resent successfully.
        ResponseStatus status = new ResponseStatus(
            messageSource.getMessage("otp.sent.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return new ResponseEntity<>(status,HttpStatus.OK);
    }
}
