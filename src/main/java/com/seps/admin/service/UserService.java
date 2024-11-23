package com.seps.admin.service;

import com.google.gson.Gson;
import com.seps.admin.config.Constants;
import com.seps.admin.domain.*;
import com.seps.admin.enums.*;
import com.seps.admin.repository.AuthorityRepository;
import com.seps.admin.repository.RoleRepository;
import com.seps.admin.repository.UserRepository;
import com.seps.admin.security.AuthoritiesConstants;
import com.seps.admin.security.SecurityUtils;
import com.seps.admin.service.dto.FIUserDTO;
import com.seps.admin.service.dto.RequestInfo;
import com.seps.admin.suptech.service.dto.PersonInfoDTO;
import com.seps.admin.service.dto.SEPSUserDTO;
import com.seps.admin.service.mapper.UserMapper;
import com.seps.admin.service.specification.UserSpecification;
import com.seps.admin.suptech.service.ExternalAPIService;
import com.seps.admin.suptech.service.PersonNotFoundException;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;
import tech.jhipster.security.RandomUtil;

import java.time.Instant;
import java.util.*;

import static com.seps.admin.component.CommonHelper.convertEntityToMap;

@Service
public class UserService {

    private static final Logger LOG = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final ExternalAPIService externalAPIService;
    private final RoleRepository roleRepository;
    private final OrganizationService organizationService;
    private final AuditLogService auditLogService;
    private final MessageSource messageSource;
    private final Gson gson;


    public UserService(UserRepository userRepository, AuthorityRepository authorityRepository,
                       PasswordEncoder passwordEncoder, UserMapper userMapper, ExternalAPIService externalAPIService,
                       RoleRepository roleRepository, OrganizationService organizationService, AuditLogService auditLogService,
                       MessageSource messageSource, Gson gson) {
        this.userRepository = userRepository;
        this.authorityRepository = authorityRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.externalAPIService = externalAPIService;
        this.roleRepository = roleRepository;
        this.organizationService = organizationService;
        this.auditLogService = auditLogService;
        this.messageSource = messageSource;
        this.gson = gson;
    }

    @Transactional
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
     * @param userDTO     the data transfer object containing user details (name, email, etc.)
     * @param requestInfo
     * @return the created {@link User} entity
     */
    @Transactional
    public User addSEPSUser(@Valid SEPSUserDTO userDTO, RequestInfo requestInfo) {
        User currenUser = getCurrentUser();
        // Fetch role or throw exception if not found
        Long roleId = userDTO.getRoleId();
        Role role = roleRepository.findByIdAndUserType(roleId, UserTypeEnum.SEPS_USER.toString())
            .orElseThrow(() -> new CustomException(Status.NOT_FOUND, SepsStatusCode.ROLE_NOT_FOUND, null, null));
        // Initialize new User and set its properties
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
        //Set Role
        Set<Role> roles = new HashSet<>();
        roles.add(role);
        newUser.setRoles(roles);
        userRepository.save(newUser);
        //Audit Logs
        Map<String, String> auditMessageMap = new HashMap<>();
        Map<String, Object> entityData = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.seps.user.created",
                new Object[]{currenUser.getEmail(), newUser.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        entityData.put(Constants.NEW_DATA, convertEntityToMap(this.getSEPSUserById(newUser.getId())));
        String requestBody = gson.toJson(userDTO);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "addSEPSUser", ActionTypeEnum.SEPS_USER_ADD.name(), newUser.getId(), User.class.getSimpleName(),
            null, auditMessageMap, entityData, ActivityTypeEnum.DATA_ENTRY.name(), requestBody);
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
     * @param id          the ID of the user to be updated
     * @param userDTO     the data transfer object containing updated user details
     * @param requestInfo
     * @throws CustomException if the user is not found or lacks SEPS authority
     */
    @Transactional
    public void editSEPSUser(Long id, @Valid SEPSUserDTO userDTO, RequestInfo requestInfo) {
        User currenUser = getCurrentUser();
        User user = userRepository.findById(id).orElseThrow(
            () -> new CustomException(Status.NOT_FOUND, SepsStatusCode.USER_NOT_FOUND,
                new String[]{id.toString()}, null));

        List<String> authorityList = user.getAuthorities().stream().map(authority -> authority.getName()).toList();
        if (!authorityList.contains(AuthoritiesConstants.SEPS)) {
            LOG.warn("SEPS User not found with id:{}", id);
            throw new CustomException(Status.NOT_FOUND, SepsStatusCode.SEPS_USER_NOT_FOUND,
                new String[]{id.toString()}, null);
        }
        // Fetch role or throw exception if not found
        Long roleId = userDTO.getRoleId();
        Role role = roleRepository.findByIdAndUserType(roleId, UserTypeEnum.SEPS_USER.toString())
            .orElseThrow(() -> new CustomException(Status.NOT_FOUND, SepsStatusCode.ROLE_NOT_FOUND, null, null));
        //Old Data
        Map<String, Object> oldData = convertEntityToMap(this.getSEPSUserById(id));

        user.setFirstName(userDTO.getName());
        user.setLangKey(userDTO.getLangKey());
        user.setCountryCode(userDTO.getCountryCode());
        user.setPhoneNumber(userDTO.getPhoneNumber());
        userRepository.save(user);
        //Audit Logs
        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.seps.user.updated",
                new Object[]{currenUser.getEmail(), user.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getSEPSUserById(user.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        String requestBody = gson.toJson(userDTO);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "editSEPSUser", ActionTypeEnum.SEPS_USER_EDIT.name(), user.getId(), User.class.getSimpleName(),
            null, auditMessageMap, entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);
    }

    /**
     * Retrieves a SEPS user by ID, including their authorities.
     *
     * @param id the ID of the user
     * @return the SEPSUserDTO containing user information
     * @throws CustomException if the user is not found or not a SEPS user
     */
    @Transactional(readOnly = true)
    public SEPSUserDTO getSEPSUserById(Long id) {
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
    public Page<SEPSUserDTO> listSEPSUsers(Pageable pageable, String search, UserStatusEnum status,Long roleId) {
        List<String> authorities = new ArrayList<>();
        authorities.add(AuthoritiesConstants.SEPS);
        return userRepository.findAll(UserSpecification.byFilter(search, status, authorities, roleId), pageable)
            .map(userMapper::userToSEPSUserDTO);
    }

    @Transactional
    public void changeSEPSStatus(Long id, UserStatusEnum newStatus, RequestInfo requestInfo) {
        User currenUser = getCurrentUser();
        User user = userRepository.findOneWithAuthoritiesById(id).orElseThrow(
            () -> new CustomException(Status.NOT_FOUND, SepsStatusCode.USER_NOT_FOUND,
                new String[]{id.toString()}, null));
        List<String> authorityList = user.getAuthorities().stream().map(authority -> authority.getName()).toList();
        if (!authorityList.contains(AuthoritiesConstants.SEPS)) {
            LOG.warn("SEPS User not found with id:{}", id);
            throw new CustomException(Status.NOT_FOUND, SepsStatusCode.SEPS_USER_NOT_FOUND,
                new String[]{id.toString()}, null);
        }
        // Check if the status change is valid
        UserStatusEnum currentStatus = user.getStatus();
        if ((currentStatus == UserStatusEnum.ACTIVE && newStatus != UserStatusEnum.BLOCKED) ||
            (currentStatus == UserStatusEnum.BLOCKED && newStatus != UserStatusEnum.ACTIVE)) {
            LOG.warn("Invalid status transition for SEPS user with id: {}. Current status: {}, New status: {}",
                id, currentStatus, newStatus);
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_STATUS_TRANSITION,
                new String[]{currentStatus.toString(), newStatus.toString()}, null);
        }
        //Old Data
        Map<String, Object> oldData = convertEntityToMap(this.getSEPSUserById(user.getId()));
        user.setStatus(newStatus);
        userRepository.save(user);
        //Audit Log
        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.seps.user.status.change",
                new Object[]{currenUser.getEmail(), user.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getSEPSUserById(user.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        Map<String, Object> req = new HashMap<>();
        String requestBody = null;
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "changeSEPSStatus", ActionTypeEnum.SEPS_USER_STATUS_CHANGE.name(), user.getId(), User.class.getSimpleName(),
            null, auditMessageMap, entityData, ActivityTypeEnum.STATUS_CHANGE.name(), requestBody);
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

    /**
     * Adds a new Financial Institution (FI) user.
     *
     * <p>This method validates the provided user details, checks for duplicate email or identificacion, and creates
     * a new user with the provided information. The user is assigned a random password and appropriate roles and authorities.
     * After creating the user, an audit log entry is made to track the creation.</p>
     *
     * @param userDTO     the data transfer object containing the user information
     * @param requestInfo the request information for logging purposes
     * @return the newly created {@link User} object
     * @throws CustomException if the email is already in use or if a user with the same identificacion exists
     */
    @Transactional
    public User addFIUser(@Valid FIUserDTO userDTO, RequestInfo requestInfo) {
        User currenUser = getCurrentUser();
        // Fetch and verify personal and organizational details
        String identificacion = userDTO.getIdentificacion();
        PersonInfoDTO personInfoDTO = fetchPersonDetails(identificacion);
        String ruc = userDTO.getRuc();
        Organization organization = organizationService.getOrganizationByRuc(ruc);
        // Check if email is already in use
        String userEmail = userDTO.getEmail();
        if (userRepository.findOneByEmailIgnoreCase(userEmail).isPresent()) {
            LOG.warn("Email {} already in use.", userEmail);
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.EMAIL_ALREADY_USED, null, null);
        }
        // Check if FI user with given identificacion already exists with specific authorities and statuses
        Set<Authority> authorities = new HashSet<>();
        authorityRepository.findById(AuthoritiesConstants.FI).ifPresent(authorities::add);
        Set<UserStatusEnum> requiredStatuses = Set.of(UserStatusEnum.PENDING, UserStatusEnum.ACTIVE, UserStatusEnum.BLOCKED);
        if (userRepository.findOneByIdentificacionAndAuthoritiesInAndStatusIn(identificacion, authorities, requiredStatuses).isPresent()) {
            LOG.warn("User with identificacion {} already exists.", identificacion);
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.FI_USER_ALREADY_EXIST, new String[]{identificacion}, null);
        }
        // Fetch role or throw exception if not found
        Long roleId = userDTO.getRoleId();
        Role role = roleRepository.findByIdAndUserType(roleId, UserTypeEnum.FI_USER.toString())
            .orElseThrow(() -> new CustomException(Status.NOT_FOUND, SepsStatusCode.ROLE_NOT_FOUND, null, null));
        // Initialize new User and set its properties
        User newUser = new User();
        newUser.setFirstName(personInfoDTO.getNombreCompleto());
        if (userEmail != null) {
            String normalizedEmail = userEmail.toLowerCase();
            newUser.setEmail(normalizedEmail);
            newUser.setLogin(normalizedEmail);
        }
        newUser.setLangKey(userDTO.getLangKey());
        // Set up password and activation status
        String randomPassword = RandomUtil.generatePassword();
        String encryptedPassword = passwordEncoder.encode(randomPassword);
        newUser.setPassword(encryptedPassword);
        newUser.setActivated(true);
        // Set user contact and status details
        newUser.setCountryCode(userDTO.getCountryCode());
        newUser.setPhoneNumber(userDTO.getPhoneNumber());
        newUser.setResetKey(RandomUtil.generateResetKey());
        newUser.setResetDate(Instant.now());
        newUser.setPasswordSet(false);
        newUser.setStatus(UserStatusEnum.ACTIVE);
        newUser.setIdentificacion(identificacion);
        newUser.setOrganization(organization);
        // Set authorities and roles
        newUser.setAuthorities(authorities);
        Set<Role> roles = new HashSet<>();
        roles.add(role);
        newUser.setRoles(roles);
        // Save the user and log creation info
        userRepository.save(newUser);
        //Audit Logs
        Map<String, String> auditMessageMap = new HashMap<>();
        Map<String, Object> entityData = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.fi.user.created",
                new Object[]{currenUser.getEmail(), newUser.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        entityData.put(Constants.NEW_DATA, convertEntityToMap(this.getFIUserById(newUser.getId())));
        String requestBody = gson.toJson(userDTO);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "addFIUser", ActionTypeEnum.FI_USER_ADD.name(), newUser.getId(), User.class.getSimpleName(),
            null, auditMessageMap, entityData, ActivityTypeEnum.DATA_ENTRY.name(), requestBody);
        LOG.debug("Created Information for FI User: {}", newUser);
        return newUser;
    }


    /**
     * Retrieves a Financial Institution (FI) user by their ID.
     *
     * <p>This method fetches a user by ID, checks if they have the appropriate FI authority, and returns the corresponding
     * {@link FIUserDTO}. If the user is not found or does not have the correct authority, an exception is thrown.
     *
     * @param id the ID of the user to retrieve
     * @return the {@link FIUserDTO} representation of the user with the specified ID
     * @throws CustomException if the user is not found or does not have the FI authority
     */
    @Transactional
    public FIUserDTO getFIUserById(Long id) {
        User entity = userRepository.findOneWithAuthoritiesById(id).orElseThrow(
            () -> new CustomException(Status.NOT_FOUND, SepsStatusCode.USER_NOT_FOUND,
                new String[]{id.toString()}, null));
        List<String> authorityList = entity.getAuthorities().stream().map(authority -> authority.getName()).toList();
        if (!authorityList.contains(AuthoritiesConstants.FI)) {
            LOG.warn("FI User not found with id:{}", id);
            throw new CustomException(Status.NOT_FOUND, SepsStatusCode.SEPS_USER_NOT_FOUND,
                new String[]{id.toString()}, null);
        }
        FIUserDTO fiUserDTO = userMapper.userToFIUserDTO(entity);
        return fiUserDTO;

    }

    /**
     * Retrieves a paginated list of Financial Institution (FI) users based on search criteria and status.
     *
     * <p>This method filters users by search query, status, and FI authority, then returns the results in a paginated format.
     *
     * @param pageable the pagination information
     * @param search   the search query for filtering users
     * @param status   the status to filter the users by
     * @return a paginated list of FI users matching the search and status criteria
     */
    @Transactional(readOnly = true)
    public Page<FIUserDTO> listFIUsers(Pageable pageable, String search, UserStatusEnum status, Long roleId) {
        List<String> authorities = new ArrayList<>();
        authorities.add(AuthoritiesConstants.FI);
        return userRepository.findAll(UserSpecification.byFilter(search, status, authorities,roleId), pageable)
            .map(userMapper::userToFIUserDTO);
    }


    /**
     * Updates a Financial Institution (FI) user's details, including language key, country code, phone number, and roles,
     * with validations and audit logging.
     *
     * <p>This method verifies the user's existence and FI authority, checks the specified role, updates user information,
     * and records an audit log of the changes.
     *
     * @param id          the ID of the user to update
     * @param userDTO     the DTO containing the updated user information
     * @param requestInfo details of the request, such as source and IP address
     * @throws CustomException if the user, FI authority, or role is not found
     */
    @Transactional
    public void editFIUser(Long id, @Valid FIUserDTO userDTO, RequestInfo requestInfo) {
        User currenUser = getCurrentUser();
        User user = userRepository.findOneWithAuthoritiesById(id).orElseThrow(() -> new CustomException(Status.NOT_FOUND, SepsStatusCode.USER_NOT_FOUND,
            new String[]{id.toString()}, null));
        List<String> authorityList = user.getAuthorities().stream().map(authority -> authority.getName()).toList();
        if (!authorityList.contains(AuthoritiesConstants.FI)) {
            LOG.warn("FI User not found with id:{}", id);
            throw new CustomException(Status.NOT_FOUND, SepsStatusCode.FI_USER_NOT_FOUND,
                new String[]{id.toString()}, null);
        }
        // Fetch role or throw exception if not found
        Long roleId = userDTO.getRoleId();
        Role role = roleRepository.findByIdAndUserType(roleId, UserTypeEnum.FI_USER.toString())
            .orElseThrow(() -> new CustomException(Status.NOT_FOUND, SepsStatusCode.ROLE_NOT_FOUND, null, null));
        //Old Data
        Map<String, Object> oldData = convertEntityToMap(this.getFIUserById(user.getId()));
        user.setLangKey(userDTO.getLangKey());
        user.setCountryCode(userDTO.getCountryCode());
        user.setPhoneNumber(userDTO.getPhoneNumber());
        // Set authorities and roles
        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);
        userRepository.save(user);
        //Audit Logs
        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.fi.user.updated",
                new Object[]{currenUser.getEmail(), user.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getFIUserById(user.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        String requestBody = gson.toJson(userDTO);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "editFIUser", ActionTypeEnum.FI_USER_EDIT.name(), user.getId(), User.class.getSimpleName(),
            null, auditMessageMap, entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);

    }

    /**
     * Updates the status of a Financial Institution (FI) user to a new status, with validations and audit logging.
     *
     * <p>This method verifies the user's existence, checks their FI authority, validates the status transition,
     * updates the status, and records an audit log of the change.
     *
     * @param id          the ID of the user to update
     * @param newStatus   the new status to set for the user
     * @param requestInfo details of the request, such as source and IP address
     * @throws CustomException if the user is not found, lacks FI authority, or the status transition is invalid
     */
    @Transactional
    public void changeFIStatus(Long id, UserStatusEnum newStatus, RequestInfo requestInfo) {
        User currenUser = getCurrentUser();
        User user = userRepository.findOneWithAuthoritiesById(id).orElseThrow(
            () -> new CustomException(Status.NOT_FOUND, SepsStatusCode.USER_NOT_FOUND,
                new String[]{id.toString()}, null));
        List<String> authorityList = user.getAuthorities().stream().map(authority -> authority.getName()).toList();
        if (!authorityList.contains(AuthoritiesConstants.FI)) {
            LOG.warn("FI User not found with id:{}", id);
            throw new CustomException(Status.NOT_FOUND, SepsStatusCode.FI_USER_NOT_FOUND,
                new String[]{id.toString()}, null);
        }
        // Check if the status change is valid
        UserStatusEnum currentStatus = user.getStatus();
        if ((currentStatus == UserStatusEnum.ACTIVE && newStatus != UserStatusEnum.BLOCKED) ||
            (currentStatus == UserStatusEnum.BLOCKED && newStatus != UserStatusEnum.ACTIVE)) {
            LOG.warn("Invalid status transition for FI user with id: {}. Current status: {}, New status: {}",
                id, currentStatus, newStatus);
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_STATUS_TRANSITION,
                new String[]{currentStatus.toString(), newStatus.toString()}, null);
        }
        //Old Data
        Map<String, Object> oldData = convertEntityToMap(this.getFIUserById(user.getId()));
        user.setStatus(newStatus);
        userRepository.save(user);
        //Audit Log
        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.fi.user.status.change",
                new Object[]{currenUser.getEmail(), user.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getFIUserById(user.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        Map<String, Object> req = new HashMap<>();
        String requestBody = null;
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "changeFIStatus", ActionTypeEnum.FI_USER_STATUS_CHANGE.name(), user.getId(), User.class.getSimpleName(),
            null, auditMessageMap, entityData, ActivityTypeEnum.STATUS_CHANGE.name(), requestBody);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CURRENT_USER_NOT_FOUND, null, null));
    }

}
