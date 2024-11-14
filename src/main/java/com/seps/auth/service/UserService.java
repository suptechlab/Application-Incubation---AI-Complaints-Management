package com.seps.auth.service;

import com.seps.auth.config.Constants;
import com.seps.auth.domain.*;
import com.seps.auth.enums.UserStatusEnum;
import com.seps.auth.repository.*;
import com.seps.auth.security.AuthoritiesConstants;
import com.seps.auth.security.SecurityUtils;
import com.seps.auth.service.dto.AdminUserDTO;
import com.seps.auth.service.dto.RegisterUserDTO;
import com.seps.auth.service.dto.UserDTO;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import com.seps.auth.suptech.service.PersonNotFoundException;
import com.seps.auth.web.rest.errors.CustomException;
import com.seps.auth.web.rest.errors.SepsStatusCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;
import tech.jhipster.security.RandomUtil;
import com.seps.auth.suptech.service.dto.PersonInfoDTO;
import com.seps.auth.suptech.service.ExternalAPIService;

/**
 * Service class for managing users.
 */
@Service
@Transactional
public class UserService {

    private static final Logger LOG = LoggerFactory.getLogger(UserService.class);

    public static final String INITIATED = "INITIATED";

    public static final String SUCCESS = "SUCCESS";

    public static final String FAILED = "FAILED";

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthorityRepository authorityRepository;

    private final LoginLogRepository loginLogRepository;

    private final RecaptchaService recaptchaService;

    private final ExternalAPIService externalAPIService;

    private final OtpService otpService;

    private final PersonaRepository personaRepository;

    private final OtpRepository otpRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthorityRepository authorityRepository,
                       LoginLogRepository loginLogRepository, RecaptchaService recaptchaService, ExternalAPIService externalAPIService, OtpService otpService, PersonaRepository personaRepository, OtpRepository otpRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authorityRepository = authorityRepository;
        this.loginLogRepository = loginLogRepository;
        this.recaptchaService = recaptchaService;
        this.externalAPIService = externalAPIService;
        this.otpService = otpService;
        this.personaRepository = personaRepository;
        this.otpRepository = otpRepository;
    }

    public Optional<User> activateRegistration(String key) {
        LOG.debug("Activating user for activation key {}", key);
        return userRepository
            .findOneByActivationKey(key)
            .map(user -> {
                // activate given user for the registration key.
                user.setActivated(true);
                user.setActivationKey(null);
                LOG.debug("Activated user: {}", user);
                return user;
            });
    }

    public Optional<User> completePasswordReset(String newPassword, String key) {
        LOG.debug("Reset user password for reset key {}", key);
        return userRepository
            .findOneByResetKey(key)
            .filter(user -> user.getResetDate().isAfter(Instant.now().minus(1, ChronoUnit.DAYS)))
            .map(user -> {
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setResetKey(null);
                user.setResetDate(null);
                return user;
            });
    }

    public Optional<User> requestPasswordReset(String mail) {
        return userRepository
            .findOneByEmailIgnoreCase(mail)
            .filter(User::isActivated)
            .map(user -> {
                user.setResetKey(RandomUtil.generateResetKey());
                user.setResetDate(Instant.now());
                return user;
            });
    }

//    public User registerUser(AdminUserDTO userDTO, String password) {
//        userRepository
//            .findOneByLogin(userDTO.getLogin().toLowerCase())
//            .ifPresent(existingUser -> {
//                boolean removed = removeNonActivatedUser(existingUser);
//                if (!removed) {
//                    throw new UsernameAlreadyUsedException();
//                }
//            });
//        userRepository
//            .findOneByEmailIgnoreCase(userDTO.getEmail())
//            .ifPresent(existingUser -> {
//                boolean removed = removeNonActivatedUser(existingUser);
//                if (!removed) {
//                    throw new EmailAlreadyUsedException();
//                }
//            });
//        User newUser = new User();
//        String encryptedPassword = passwordEncoder.encode(password);
//        newUser.setLogin(userDTO.getLogin().toLowerCase());
//        // new user gets initially a generated password
//        newUser.setPassword(encryptedPassword);
//        newUser.setFirstName(userDTO.getFirstName());
//        newUser.setLastName(userDTO.getLastName());
//        if (userDTO.getEmail() != null) {
//            newUser.setEmail(userDTO.getEmail().toLowerCase());
//        }
//        newUser.setImageUrl(userDTO.getImageUrl());
//        newUser.setLangKey(userDTO.getLangKey());
//        // new user is not active
//        newUser.setActivated(false);
//        // new user gets registration key
//        newUser.setActivationKey(RandomUtil.generateActivationKey());
//        Set<Authority> authorities = new HashSet<>();
//        authorityRepository.findById(AuthoritiesConstants.USER).ifPresent(authorities::add);
//        newUser.setAuthorities(authorities);
//        userRepository.save(newUser);
//        LOG.debug("Created Information for User: {}", newUser);
//        return newUser;
//    }

    private boolean removeNonActivatedUser(User existingUser) {
        if (existingUser.isActivated()) {
            return false;
        }
        userRepository.delete(existingUser);
        userRepository.flush();
        return true;
    }

    public User createUser(AdminUserDTO userDTO) {
        User user = new User();
        user.setLogin(userDTO.getLogin().toLowerCase());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        if (userDTO.getEmail() != null) {
            user.setEmail(userDTO.getEmail().toLowerCase());
        }
        user.setImageUrl(userDTO.getImageUrl());
        if (userDTO.getLangKey() == null) {
            user.setLangKey(Constants.DEFAULT_LANGUAGE); // default language
        } else {
            user.setLangKey(userDTO.getLangKey());
        }
        String encryptedPassword = passwordEncoder.encode(RandomUtil.generatePassword());
        user.setPassword(encryptedPassword);
        user.setResetKey(RandomUtil.generateResetKey());
        user.setResetDate(Instant.now());
        user.setActivated(true);
        if (userDTO.getAuthorities() != null) {
            Set<Authority> authorities = userDTO
                .getAuthorities()
                .stream()
                .map(authorityRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toSet());
            user.setAuthorities(authorities);
        }
        userRepository.save(user);
        LOG.debug("Created Information for User: {}", user);
        return user;
    }

    /**
     * Update all information for a specific user, and return the modified user.
     *
     * @param userDTO user to update.
     * @return updated user.
     */
    public Optional<AdminUserDTO> updateUser(AdminUserDTO userDTO) {
        return Optional.of(userRepository.findById(userDTO.getId()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .map(user -> {
                user.setLogin(userDTO.getLogin().toLowerCase());
                user.setFirstName(userDTO.getFirstName());
                user.setLastName(userDTO.getLastName());
                if (userDTO.getEmail() != null) {
                    user.setEmail(userDTO.getEmail().toLowerCase());
                }
                user.setImageUrl(userDTO.getImageUrl());
                user.setActivated(userDTO.isActivated());
                user.setLangKey(userDTO.getLangKey());
                Set<Authority> managedAuthorities = user.getAuthorities();
                managedAuthorities.clear();
                userDTO
                    .getAuthorities()
                    .stream()
                    .map(authorityRepository::findById)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .forEach(managedAuthorities::add);
                userRepository.save(user);
                LOG.debug("Changed Information for User: {}", user);
                return user;
            })
            .map(AdminUserDTO::new);
    }

    public void deleteUser(String login) {
        userRepository
            .findOneByLogin(login)
            .ifPresent(user -> {
                userRepository.delete(user);
                LOG.debug("Deleted User: {}", user);
            });
    }

    /**
     * Update basic information (first name, last name, email, language) for the current user.
     *
     * @param firstName   first name of user.
     * @param lastName    last name of user.
     * @param langKey     language key.
     * @param imageUrl    image URL of user.
     * @param countryCode countryCode  of user.
     * @param phoneNumber phoneNumber  of user.
     */
    public void updateUser(String firstName, String lastName, String langKey, String imageUrl,
                           String countryCode, String phoneNumber) {
        SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .ifPresent(user -> {
                user.setFirstName(firstName);
                user.setLastName(lastName);
                user.setLangKey(langKey);
                user.setImageUrl(imageUrl);
                user.setCountryCode(countryCode);
                user.setPhoneNumber(phoneNumber);
                userRepository.save(user);
                LOG.debug("Changed Information for User: {}", user);
            });
    }

    @Transactional
    public void changePassword(String currentClearTextPassword, String newPassword) {
        SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .ifPresent(user -> {
                String currentEncryptedPassword = user.getPassword();
                // Check if the provided current password matches the stored password
                if (!passwordEncoder.matches(currentClearTextPassword, currentEncryptedPassword)) {
                    LOG.warn("User current password is invalid");
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_PASSWORD_INCORRECT, null, null);
                }
                // Check if the new password is the same as the current password
                if (passwordEncoder.matches(newPassword, currentEncryptedPassword)) {
                    LOG.warn("New password must be different from the current password");
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.NEW_PASSWORD_SAME_AS_CURRENT, null, null);
                }
                String encryptedPassword = passwordEncoder.encode(newPassword);
                user.setPassword(encryptedPassword);
                LOG.debug("Changed password for User: {}", user);
            });
    }

    @Transactional(readOnly = true)
    public Page<AdminUserDTO> getAllManagedUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(AdminUserDTO::new);
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> getAllPublicUsers(Pageable pageable) {
        return userRepository.findAllByIdNotNullAndActivatedIsTrue(pageable).map(UserDTO::new);
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserWithAuthoritiesByLogin(String login) {
        return userRepository.findOneWithAuthoritiesByLogin(login);
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserWithAuthorities() {
        return SecurityUtils.getCurrentUserLogin().flatMap(userRepository::findOneWithAuthoritiesByLogin);
    }

    /**
     * Not activated users should be automatically deleted after 3 days.
     * <p>
     * This is scheduled to get fired everyday, at 01:00 (am).
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void removeNotActivatedUsers() {
        userRepository
            .findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(Instant.now().minus(3, ChronoUnit.DAYS))
            .forEach(user -> {
                LOG.debug("Deleting not activated user {}", user.getLogin());
                userRepository.delete(user);
            });
    }

    /**
     * Gets a list of all the authorities.
     *
     * @return a list of all the authorities.
     */
    @Transactional(readOnly = true)
    public List<String> getAuthorities() {
        return authorityRepository.findAll().stream().map(Authority::getName).toList();
    }

    public User updateUserOtpInfo(String username) {
        User user = userRepository.findOneByLogin(username)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_NOT_FOUND, null, null));
        // Generate OTP data using OtpService
        String otpCode = otpService.generateOtpCode();
        Instant otpExpirationTime = otpService.getOtpExpirationTime();
        String otpToken = otpService.generateOtpToken();
        Instant otpTokenExpirationTime = otpService.getOtpTokenExpirationTime();
        // Update user's OTP information
        user.setOtpCode(otpCode);
        user.setOtpCodeExpirationTime(otpExpirationTime);
        user.setOtpToken(otpToken);
        user.setOtpTokenExpirationTime(otpTokenExpirationTime);
        // Save user with updated OTP information
        return userRepository.save(user);
    }

    /**
     * Verifies if the provided OTP token is valid for the user and not expired.
     *
     * @param otpToken the OTP token to verify
     * @return true if the OTP token is valid and not expired; false otherwise
     */
    public boolean verifyOtpToken(String otpToken) {
        User user = userRepository.findByOtpToken(otpToken)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_OTP_TOKEN, null, null));
        return user.getOtpTokenExpirationTime().isAfter(Instant.now());
    }

    /**
     * Verifies if the provided OTP code matches the one associated with the OTP token for the user.
     *
     * @param otpCode  the OTP code provided by the user
     * @param otpToken the OTP token to which the code should correspond
     * @return true if the OTP code is correct for the provided token; false otherwise
     */
    public boolean verifyOtpCode(String otpCode, String otpToken) {
        User user = userRepository.findByOtpToken(otpToken)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_OTP_CODE, null, null));
        return otpCode.equals(user.getOtpCode());
    }

    public Optional<User> findUserByOtpToken(String otpToken) {
        Optional<User> userOptional = userRepository.findByOtpToken(otpToken);
        if (userOptional.isEmpty()) {
            LOG.warn("No user found for OTP token: {}", otpToken);
        }
        return userOptional;
    }

    /**
     * Clears the OTP token, OTP code, and their expiration times for the user and saves the updated user.
     *
     * @param user the user entity to update
     * @return the updated user with cleared OTP fields
     */
    public User clearOtpData(User user) {
        // Set OTP fields to null
        user.setOtpToken(null);
        user.setOtpCode(null);
        user.setOtpTokenExpirationTime(null);
        user.setOtpCodeExpirationTime(null);
        // Save the updated user to the database
        return userRepository.save(user);
    }

    public User updateUserOtpCode(User user) {
        String otpCode = otpService.generateOtpCode();
        Instant otpExpirationTime = otpService.getOtpExpirationTime();
        user.setOtpCode(otpCode);
        user.setOtpCodeExpirationTime(otpExpirationTime);
        // Save user with updated OTP information
        return userRepository.save(user);
    }

    public void save(User user) {
        userRepository.save(user);
    }

    public void logSuccessfulLogin(User user, String clientIp) {
        Instant instant = Instant.now();
        // Update lastLoggedIn and currentLoggedIn timestamps
        user.setLastLoggedIn(user.getCurrentLoggedIn()); // Set last login time to previous current login time
        user.setCurrentLoggedIn(instant); // Update current login time to now
        userRepository.save(user);
        LoginLog successLoginLog = new LoginLog(user.getId(), instant, UserService.SUCCESS, clientIp);
        loginLogRepository.save(successLoginLog);
    }

    public void saveLoginLog(User user, String status, String clientIp) {
        LoginLog successLoginLog = new LoginLog(user.getId(), Instant.now(), status, clientIp);
        loginLogRepository.save(successLoginLog);
    }

    /**
     * Helper method to verify the Recaptcha token and handle exceptions
     */
    public boolean isRecaptchaValid(String recaptchaToken) {
        try {
            return recaptchaService.verifyRecaptcha(recaptchaToken);
        } catch (IOException e) {
            LOG.error("Error while verifying recaptcha token: {}", e.getMessage());
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.RECAPTCHA_FAILED, null, null);
        }
    }

    /**
     * Fetches detailed information of a person based on their identification.
     * <p>
     * This method first tries to retrieve person details from an external API.
     * If the person record is not found in the database, it saves the new details to the database.
     * </p>
     *
     * @param identificacion The national identification number of the person.
     * @return PersonInfoDTO containing the person's details.
     * @throws CustomException if the person is not found in the external API.
     */
    public PersonInfoDTO fetchPersonDetails(String identificacion) {
        try {
            PersonInfoDTO personInfoDTO = externalAPIService.getPersonInfo(identificacion);
            Optional<Persona> optionalPersona = personaRepository.findByIdentificacion(identificacion);
            if (!optionalPersona.isPresent()) {
                Persona persona = new Persona();
                persona.setIdentificacion(identificacion);
                persona.setNombreCompleto(personInfoDTO.getNombreCompleto());
                persona.setGenero(personInfoDTO.getGenero());
                persona.setLugarNacimiento(personInfoDTO.getLugarNacimiento());
                persona.setNacionalidad(personInfoDTO.getNacionalidad());
                personaRepository.save(persona);
            }
            return personInfoDTO;
        } catch (PersonNotFoundException e) {
            throw new CustomException(Status.NOT_FOUND, SepsStatusCode.PERSON_NOT_FOUND,
                new String[]{identificacion}, null);
        }
    }

    @Transactional
    public User registerUser(RegisterUserDTO userDTO) {
        userRepository
            .findOneByEmailIgnoreCase(userDTO.getEmail())
            .ifPresent(existingUser -> {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.EMAIL_ALREADY_USED, null, null);
            });
        String email = userDTO.getEmail();
        Otp otpEntity = otpRepository.findOneByEmailIgnoreCase(email)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_OTP_CODE, null, null));
        if (otpEntity.getExpiryTime().isBefore(Instant.now())) {
            LOG.error("OTP code is expired");
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_OTP_CODE, null, null);
        }
        if (!otpEntity.isUsed()) {
            LOG.error("Email not verified :{}", email);
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.EMAIL_NOT_VERIFIED, null, null);
        }
        String identificacion = userDTO.getIdentificacion();
        Set<Authority> authorities = new HashSet<>();
        authorityRepository.findById(AuthoritiesConstants.USER).ifPresent(authorities::add);
        userRepository
            .findOneByIdentificacionAndAuthoritiesIn(identificacion, authorities)
            .ifPresent(existingUser -> {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_IDENTIFICATION_ALREADY_EXIST, new String[]{identificacion}, null);
            });

        Persona persona = getPersonaByIdentificacion(identificacion);
        String normalizeEmail = userDTO.getEmail().toLowerCase();
        User newUser = new User();
        String encryptedPassword = passwordEncoder.encode(RandomUtil.generatePassword());
        newUser.setLogin(normalizeEmail);
        // new user gets initially a generated password
        newUser.setPassword(encryptedPassword);
        newUser.setFirstName(persona.getNombreCompleto());
        newUser.setEmail(normalizeEmail);
        newUser.setLangKey(Constants.DEFAULT_LANGUAGE);
        newUser.setActivated(true);
        newUser.setCountryCode(userDTO.getCountryCode());
        newUser.setPhoneNumber(userDTO.getPhoneNumber());
        newUser.setStatus(UserStatusEnum.ACTIVE);
        newUser.setPasswordSet(false);
        newUser.setIdentificacion(identificacion);
        newUser.setGender(persona.getGenero());
        newUser.setFingerprintVerified(false);
        //Set Authorities
        newUser.setAuthorities(authorities);
        userRepository.save(newUser);
        LOG.debug("Created Information for Registered User: {}", newUser);
        otpRepository.deleteByEmail(email);
        return newUser;
    }

    @Transactional
    public Persona getPersonaByIdentificacion(String identificacion) {
        return personaRepository.findByIdentificacion(identificacion)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.PERSON_NOT_FOUND,
                new String[]{identificacion}, null));
    }

}
