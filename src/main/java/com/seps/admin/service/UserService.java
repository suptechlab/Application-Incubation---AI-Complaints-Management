package com.seps.admin.service;

import com.seps.admin.domain.Authority;
import com.seps.admin.domain.User;
import com.seps.admin.enums.UserStatusEnum;
import com.seps.admin.repository.AuthorityRepository;
import com.seps.admin.repository.UserRepository;
import com.seps.admin.security.AuthoritiesConstants;
import com.seps.admin.security.SecurityUtils;
import com.seps.admin.service.dto.FIUserDTO;
import com.seps.admin.suptech.service.dto.PersonInfoDTO;
import com.seps.admin.service.dto.SEPSUserDTO;
import com.seps.admin.service.mapper.UserMapper;
import com.seps.admin.service.specification.SepsUserSpecification;
import com.seps.admin.suptech.service.ExternalAPIService;
import com.seps.admin.suptech.service.PersonNotFoundException;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;
import tech.jhipster.security.RandomUtil;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    private static final Logger LOG = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final ExternalAPIService externalAPIService;

    public UserService(UserRepository userRepository, AuthorityRepository authorityRepository,
                       PasswordEncoder passwordEncoder, UserMapper userMapper, ExternalAPIService externalAPIService) {
        this.userRepository = userRepository;
        this.authorityRepository = authorityRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.externalAPIService = externalAPIService;
    }

    public User getCurrentUser() {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneWithAuthoritiesByLogin)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CURRENT_USER_NOT_FOUND, null, null));
    }

    /**
     * Adds a new SEPS user with details from the provided {@code SEPSUserDTO}.
     * <p>
     * This method initializes the user with a random encrypted password, assigns default SEPS
     * authority, and sets the user's status to active. The user's email is used as both the login and email, in lowercase.
     * </p>
     *
     * @param userDTO the data transfer object containing user details (name, email, etc.)
     * @return the created {@link User} entity
     */
    @Transactional
    public User addSepsUser(@Valid SEPSUserDTO userDTO) {
        User newUser = new User();
        // for a new user sets initially a random password
        newUser.setFirstName(userDTO.getName());
        if (userDTO.getEmail() != null) {
            newUser.setEmail(userDTO.getEmail().toLowerCase());
            newUser.setLogin(userDTO.getEmail().toLowerCase());
        }
        newUser.setLangKey(userDTO.getLangKey());
        String randomPassword = RandomUtil.generatePassword();
        String encryptedPassword = passwordEncoder.encode(randomPassword);
        newUser.setPassword(encryptedPassword);
        newUser.setActivated(true);
        newUser.setCountryCode(userDTO.getCountryCode());
        newUser.setPhoneNumber(userDTO.getPhoneNumber());
        //Set Reset Password
        newUser.setResetKey(RandomUtil.generateResetKey());
        newUser.setResetDate(Instant.now());
        newUser.setPasswordSet(false);
        newUser.setStatus(UserStatusEnum.ACTIVE);
        //Set Authority
        Set<Authority> authorities = new HashSet<>();
        authorityRepository.findById(AuthoritiesConstants.SEPS).ifPresent(authorities::add);
        newUser.setAuthorities(authorities);
        userRepository.save(newUser);
        LOG.debug("Created Information for SEPS User: {}", newUser);
        return newUser;
    }

    /**
     * Updates an existing SEPS user's details based on the provided {@code SEPSUserDTO}.
     * <p>
     * This method retrieves the user by ID, verifies that the user has SEPS authority, and updates
     * the user's information such as first name, last name, language key, country code, and phone number.
     * If the user is not found or does not have SEPS authority, a {@code CustomException} is thrown.
     * </p>
     *
     * @param id  the ID of the user to be updated
     * @param dto the data transfer object containing updated user details
     * @throws CustomException if the user is not found or lacks SEPS authority
     */
    @Transactional
    public void updateSepsUser(Long id, @Valid SEPSUserDTO dto) {
        User entity = userRepository.findById(id).orElseThrow(
            () -> new CustomException(Status.NOT_FOUND, SepsStatusCode.USER_NOT_FOUND,
                new String[]{id.toString()}, null));

        List<String> authorityList = entity.getAuthorities().stream().map(authority -> authority.getName()).toList();
        if (!authorityList.contains(AuthoritiesConstants.SEPS)) {
            LOG.warn("SEPS User not found with id:{}", id);
            throw new CustomException(Status.NOT_FOUND, SepsStatusCode.SEPS_USER_NOT_FOUND,
                new String[]{id.toString()}, null);
        }
        entity.setFirstName(dto.getName());
        entity.setLangKey(dto.getLangKey());
        entity.setCountryCode(dto.getCountryCode());
        entity.setPhoneNumber(dto.getPhoneNumber());
        userRepository.save(entity);
    }

    /**
     * Retrieves a SEPS user by ID, including their authorities.
     *
     * @param id the ID of the user
     * @return the SEPSUserDTO containing user information
     * @throws CustomException if the user is not found or not a SEPS user
     */
    @Transactional(readOnly = true)
    public SEPSUserDTO getSepsUserById(Long id) {
        User entity = userRepository.findOneWithAuthoritiesById(id).orElseThrow(
            () -> new CustomException(Status.NOT_FOUND, SepsStatusCode.USER_NOT_FOUND,
                new String[]{id.toString()}, null));
        List<String> authorityList = entity.getAuthorities().stream().map(authority -> authority.getName()).toList();
        if (!authorityList.contains(AuthoritiesConstants.SEPS)) {
            LOG.warn("SEPS User not found with id:{}", id);
            throw new CustomException(Status.NOT_FOUND, SepsStatusCode.SEPS_USER_NOT_FOUND,
                new String[]{id.toString()}, null);
        }
        SEPSUserDTO sepsUserDTO = userMapper.userToSEPSUserDTO(entity);
        return sepsUserDTO;
    }

    /**
     * Retrieves a paginated list of SEPS users based on search criteria and user status.
     *
     * @param pageable the pagination information, including page number and size
     * @param search   the search term used to filter SEPS users, applied to relevant fields
     * @param status   the status of the users to filter by, e.g., ACTIVE or INACTIVE
     * @return a paginated {@link Page} of {@link SEPSUserDTO} objects that match the filter criteria
     */
    @Transactional(readOnly = true)
    public Page<SEPSUserDTO> listSEPSUsers(Pageable pageable, String search, UserStatusEnum status) {
        List<String> authorities = new ArrayList<>();
        authorities.add(AuthoritiesConstants.SEPS);
        return userRepository.findAll(SepsUserSpecification.byFilter(search, status, authorities), pageable)
            .map(userMapper::userToSEPSUserDTO);
    }

    public void changeSEPSStatus(Long id, UserStatusEnum newStatus) {
        User entity = userRepository.findOneWithAuthoritiesById(id).orElseThrow(
            () -> new CustomException(Status.NOT_FOUND, SepsStatusCode.USER_NOT_FOUND,
                new String[]{id.toString()}, null));
        List<String> authorityList = entity.getAuthorities().stream().map(authority -> authority.getName()).toList();
        if (!authorityList.contains(AuthoritiesConstants.SEPS)) {
            LOG.warn("SEPS User not found with id:{}", id);
            throw new CustomException(Status.NOT_FOUND, SepsStatusCode.SEPS_USER_NOT_FOUND,
                new String[]{id.toString()}, null);
        }
        // Check if the status change is valid
        UserStatusEnum currentStatus = entity.getStatus();
        if ((currentStatus == UserStatusEnum.ACTIVE && newStatus != UserStatusEnum.BLOCKED) ||
            (currentStatus == UserStatusEnum.BLOCKED && newStatus != UserStatusEnum.ACTIVE)) {
            LOG.warn("Invalid status transition for SEPS user with id: {}. Current status: {}, New status: {}",
                id, currentStatus, newStatus);
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_STATUS_TRANSITION,
                new String[]{currentStatus.toString(), newStatus.toString()}, null);
        }
        entity.setStatus(newStatus);
        userRepository.save(entity);
    }

    /**
     * Fetches the details of a person based on the provided identification.
     * <p>
     * This method calls an external API service to retrieve the information of a person
     * identified by the given {@code identification}. If the person is not found, a
     * {@code PersonNotFoundException} is caught, and a {@code CustomException} with
     * a "NOT_FOUND" status is thrown, indicating that the person could not be located.
     * </p>
     *
     * @param identificacion the unique identifier of the person whose details are to be fetched.
     * @return a {@link PersonInfoDTO} containing the details of the person.
     * @throws CustomException if the person is not found, with a status code of
     *                         {@code SepsStatusCode.PERSON_NOT_FOUND}.
     */
    public PersonInfoDTO fetchPersonDetails(String identificacion) {
        try {
            return externalAPIService.getPersonInfo(identificacion);
        } catch (PersonNotFoundException e) {
            throw new CustomException(Status.NOT_FOUND, SepsStatusCode.PERSON_NOT_FOUND,
                new String[]{identificacion}, null);
        }
    }

    public User addFIUser(@Valid FIUserDTO userDTO) {
        // Lowercase the user email before comparing with database
        if (userRepository.findOneByEmailIgnoreCase(userDTO.getEmail()).isPresent()) {
            LOG.warn("Email {} already in use.", userDTO.getEmail());
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.EMAIL_ALREADY_USED, null, null);
        }
        User newUser = new User();
        // for a new user sets initially a random password
        newUser.setFirstName(userDTO.getName());
        if (userDTO.getEmail() != null) {
            newUser.setEmail(userDTO.getEmail().toLowerCase());
            newUser.setLogin(userDTO.getEmail().toLowerCase());
        }
        newUser.setLangKey(userDTO.getLangKey());
        String randomPassword = RandomUtil.generatePassword();
        String encryptedPassword = passwordEncoder.encode(randomPassword);
        newUser.setPassword(encryptedPassword);
        newUser.setActivated(true);
        newUser.setCountryCode(userDTO.getCountryCode());
        newUser.setPhoneNumber(userDTO.getPhoneNumber());
        //Set Reset Password
        newUser.setResetKey(RandomUtil.generateResetKey());
        newUser.setResetDate(Instant.now());
        newUser.setPasswordSet(false);
        newUser.setStatus(UserStatusEnum.ACTIVE);
        //Set Authority
        Set<Authority> authorities = new HashSet<>();
        authorityRepository.findById(AuthoritiesConstants.FI).ifPresent(authorities::add);
        newUser.setAuthorities(authorities);
        userRepository.save(newUser);
        LOG.debug("Created Information for FI User: {}", newUser);
        return newUser;

    }
}
