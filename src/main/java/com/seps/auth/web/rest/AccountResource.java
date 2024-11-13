package com.seps.auth.web.rest;

import com.seps.auth.domain.Otp;
import com.seps.auth.domain.User;
import com.seps.auth.repository.UserRepository;
import com.seps.auth.security.SecurityUtils;
import com.seps.auth.service.MailService;
import com.seps.auth.service.OtpService;
import com.seps.auth.service.UserService;
import com.seps.auth.service.dto.*;
import com.seps.auth.service.dto.ResponseStatus;
import com.seps.auth.web.rest.errors.*;
import com.seps.auth.web.rest.vm.KeyAndPasswordVM;
import com.seps.auth.web.rest.vm.ManagedUserVM;
import com.seps.auth.web.rest.vm.ResetPasswordVM;
import jakarta.validation.Valid;

import java.util.*;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zalando.problem.Status;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/api")
public class AccountResource {

    private static class AccountResourceException extends RuntimeException {

        private AccountResourceException(String message) {
            super(message);
        }
    }

    private static final Logger LOG = LoggerFactory.getLogger(AccountResource.class);

    private final UserRepository userRepository;

    private final UserService userService;

    private final MailService mailService;

    private final MessageSource messageSource;

    private final OtpService otpService;

    public AccountResource(UserRepository userRepository, UserService userService, MailService mailService, MessageSource messageSource, OtpService otpService) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.mailService = mailService;
        this.messageSource = messageSource;
        this.otpService = otpService;
    }

    /**
     * {@code POST  /register} : register the user.
     *
     * @param managedUserVM the managed user View Model.
     * @throws InvalidPasswordException  {@code 400 (Bad Request)} if the password is incorrect.
     * @throws EmailAlreadyUsedException {@code 400 (Bad Request)} if the email is already used.
     * @throws LoginAlreadyUsedException {@code 400 (Bad Request)} if the login is already used.
     */
    @PostMapping("/register")
    public ResponseEntity<Void> registerAccount(@Valid @RequestBody ManagedUserVM managedUserVM) {
        if (isPasswordLengthInvalid(managedUserVM.getPassword())) {
            throw new InvalidPasswordException();
        }
        User user = userService.registerUser(managedUserVM, managedUserVM.getPassword());
        mailService.sendActivationEmail(user);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /**
     * {@code GET  /activate} : activate the registered user.
     *
     * @param key the activation key.
     * @throws RuntimeException {@code 500 (Internal Server Error)} if the user couldn't be activated.
     */
    @GetMapping("/activate")
    public void activateAccount(@RequestParam(value = "key") String key) {
        Optional<User> user = userService.activateRegistration(key);
        if (!user.isPresent()) {
            throw new AccountResourceException("No user was found for this activation key");
        }
    }

    /**
     * {@code GET  /account} : get the current user.
     *
     * @return the current user.
     * @throws RuntimeException {@code 400 Bad Request} if the user couldn't be returned.
     */
    @GetMapping("/account")
    public AdminUserDTO getAccount() {
        return userService
            .getUserWithAuthorities()
            .map(AdminUserDTO::new)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_NOT_FOUND, null, null));
    }

    /**
     * {@code POST  /account} : update the current user information.
     *
     * @param userDTO the current user information.
     * @throws CustomException {@code 400 (Bad Request)} if the user login wasn't found.
     */
    @PostMapping("/account")
    public ResponseEntity<ResponseStatus> saveAccount(@Valid @RequestBody AdminUserDTO userDTO) {
        String userLogin = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CURRENT_USER_NOT_FOUND, null, null));
        Optional<User> user = userRepository.findOneByLogin(userLogin);
        if (!user.isPresent()) {
            LOG.error("User could not be found");
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_NOT_FOUND, null, null);
        }
        userService.updateUser(
            userDTO.getFirstName(),
            userDTO.getLastName(),
            userDTO.getLangKey(),
            userDTO.getImageUrl(),
            userDTO.getCountryCode(),
            userDTO.getPhoneNumber()
        );
        return new ResponseEntity<>(new ResponseStatus(
            messageSource.getMessage("user.profile.updated.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        ), HttpStatus.OK);

    }

    /**
     * {@code POST  /account/change-password} : changes the current user's password.
     *
     * @param passwordChangeDto current and new password.
     * @throws InvalidPasswordException {@code 400 (Bad Request)} if the new password is incorrect.
     */
    @PostMapping(path = "/account/change-password")
    public ResponseEntity<ResponseStatus> changePassword(@Valid @RequestBody PasswordChangeDTO passwordChangeDto) {
        if (isPasswordLengthInvalid(passwordChangeDto.getNewPassword())) {
            throw new InvalidPasswordException();
        }
        userService.changePassword(passwordChangeDto.getCurrentPassword(), passwordChangeDto.getNewPassword());
        ResponseStatus status = new ResponseStatus(
            messageSource.getMessage("user.password.changed.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        );
        return new ResponseEntity<>(status, HttpStatus.OK);

    }

    /**
     * {@code POST   /account/reset-password/init} : Send an email to reset the password of the user.
     *
     * @param resetPasswordVM email and recaptcha token.
     */
    @PostMapping(path = "/account/reset-password/init")
    public ResponseEntity<ResponseStatus> requestPasswordReset(@Valid @RequestBody ResetPasswordVM resetPasswordVM) {
        // Verify reCAPTCHA
        if (!userService.isRecaptchaValid(resetPasswordVM.getRecaptchaToken())) {
            LOG.error("In request password reset Recaptcha verification failed for token: {}", resetPasswordVM.getRecaptchaToken());
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.RECAPTCHA_FAILED, null, null);
        }
        String mail = resetPasswordVM.getEmail();
        Optional<User> user = userService.requestPasswordReset(mail);
        if (user.isPresent()) {
            mailService.sendPasswordResetMail(user.orElseThrow());
        } else {
            // Pretend the request has been successful to prevent checking which emails really exist
            // but log that an invalid attempt has been made
            LOG.warn("Password reset requested for non existing mail");
        }
        return new ResponseEntity<>(new ResponseStatus(
            messageSource.getMessage("forgot.password.mail.send.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        ), HttpStatus.OK);
    }

    /**
     * {@code POST   /account/reset-password/finish} : Finish to reset the password of the user.
     *
     * @param keyAndPassword the generated key and the new password.
     * @throws InvalidPasswordException {@code 400 (Bad Request)} if the password is incorrect.
     * @throws RuntimeException         {@code 500 (Internal Server Error)} if the password could not be reset.
     */
    @PostMapping(path = "/account/reset-password/finish")
    public ResponseEntity<ResponseStatus> finishPasswordReset(@RequestBody KeyAndPasswordVM keyAndPassword) {
        // Verify reCAPTCHA
        if (!userService.isRecaptchaValid(keyAndPassword.getRecaptchaToken())) {
            LOG.error("In finish password reset Recaptcha verification failed for token: {}", keyAndPassword.getRecaptchaToken());
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.RECAPTCHA_FAILED, null, null);
        }
        if (isPasswordLengthInvalid(keyAndPassword.getNewPassword())) {
            throw new InvalidPasswordException();
        }
        Optional<User> user = userService.completePasswordReset(keyAndPassword.getNewPassword(), keyAndPassword.getKey());
        if (!user.isPresent()) {
            LOG.error("No user was found for this reset key :{}", keyAndPassword.getKey());
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_NOT_FOUND_RESET, null, null);
        }
        return new ResponseEntity<>(new ResponseStatus(
            messageSource.getMessage("user.password.reset.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        ), HttpStatus.OK);
    }

    private static boolean isPasswordLengthInvalid(String password) {
        return (
            StringUtils.isEmpty(password) ||
                password.length() < ManagedUserVM.PASSWORD_MIN_LENGTH ||
                password.length() > ManagedUserVM.PASSWORD_MAX_LENGTH
        );
    }

    /**
     * Generates and sends a One-Time Password (OTP) to the specified email for user registration.
     * <p>
     * This endpoint creates an OTP for the provided email address to be used during the registration process.
     * The OTP is sent to the user’s email in the appropriate locale, and a response is returned with a success message,
     * HTTP status, and timestamp.
     *
     * @param requestOtpDTO contains The email address to which the registration OTP will be sent.
     * @return {@link ResponseEntity} containing a {@link ResponseStatus} with a success
     * message, HTTP status code, and the current timestamp.
     */
    @PostMapping("/register/request-otp")
    public ResponseEntity<ResponseStatus> requestRegisterOtp(@RequestBody @Valid RequestOtpDTO requestOtpDTO) {
        String email = requestOtpDTO.getEmail();
        Otp otp = otpService.generateOtp(email);
        mailService.sendRegisterOtpEmail(otp, LocaleContextHolder.getLocale());
        return new ResponseEntity<>(new ResponseStatus(
            messageSource.getMessage("otp.sent.to.email", null, LocaleContextHolder.getLocale()),
            HttpStatus.OK.value(),
            System.currentTimeMillis()
        ), HttpStatus.OK);
    }


    /**
     * Verifies the One-Time Password (OTP) for user registration.
     * <p>
     * This endpoint checks if the provided OTP is valid for the specified email address.
     * If the OTP is invalid or expired, an error is logged, and a {@link CustomException}
     * is thrown with a relevant error status and message. If the OTP is valid, a
     * {@code NO_CONTENT} status is returned, indicating successful verification.
     *
     * @param verifyOtpDTO The email address associated with the OTP to be verified.
     * @return {@link ResponseEntity} with {@code HttpStatus.NO_CONTENT} if the OTP is valid;
     * otherwise, a {@link CustomException} is thrown with an error status and message.
     * @throws CustomException if the OTP is invalid or expired.
     */
    @PostMapping("/register/verify-otp")
    public ResponseEntity<Void> verifyRegisterOtp(@Valid @RequestBody VerifyOtpDTO verifyOtpDTO) {
        String email = verifyOtpDTO.getEmail();
        String otpCode = verifyOtpDTO.getOtpCode();
        boolean isVerified = otpService.verifyOtp(email, otpCode);
        if (!isVerified) {
            LOG.error("Invalid OTP code for token: {}", otpCode);
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_OTP_CODE, null, null);
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
