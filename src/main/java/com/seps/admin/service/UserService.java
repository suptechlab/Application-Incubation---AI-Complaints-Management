package com.seps.admin.service;

import com.seps.admin.domain.Authority;
import com.seps.admin.domain.User;
import com.seps.admin.enums.UserStatusEnum;
import com.seps.admin.repository.AuthorityRepository;
import com.seps.admin.repository.UserRepository;
import com.seps.admin.security.AuthoritiesConstants;
import com.seps.admin.service.dto.SEPSUserDTO;
import com.seps.admin.service.mapper.UserMapper;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;
import tech.jhipster.security.RandomUtil;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.random.RandomGenerator;

@Service
public class UserService {

    private static final Logger LOG = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, AuthorityRepository authorityRepository,
                       PasswordEncoder passwordEncoder, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.authorityRepository = authorityRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    /**
     * Adds a new SEPS user with details from the provided {@code SEPSUserDTO}.
     * <p>
     * This method initializes the user with a random encrypted password, assigns default SEPS
     * authority, and sets the user's status to active. The user's email is used as both the login and email, in lowercase.
     * </p>
     *
     * @param userDTO the data transfer object containing user details (first name, last name, email, etc.)
     * @return the created {@link User} entity
     */
    @Transactional
    public User addSepsUser(@Valid SEPSUserDTO userDTO) {
        User newUser = new User();
        // for a new user sets initially a random password
        newUser.setFirstName(userDTO.getFirstName());
        newUser.setLastName(userDTO.getLastName());
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
        LOG.debug("authorityList:{}", authorityList);
        if (!authorityList.contains(AuthoritiesConstants.SEPS)) {
            LOG.info("SEPS User not found with id:{}", id);
            throw new CustomException(Status.NOT_FOUND, SepsStatusCode.SEPS_USER_NOT_FOUND,
                new String[]{id.toString()}, null);
        }
        entity.setFirstName(dto.getFirstName());
        entity.setLastName(dto.getLastName());
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
            LOG.info("SEPS User not found with id:{}", id);
            throw new CustomException(Status.NOT_FOUND, SepsStatusCode.SEPS_USER_NOT_FOUND,
                new String[]{id.toString()}, null);
        }
        SEPSUserDTO sepsUserDTO = userMapper.userToSEPSUserDTO(entity);
        return sepsUserDTO;
    }
}
