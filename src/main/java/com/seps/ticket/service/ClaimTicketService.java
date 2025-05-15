package com.seps.ticket.service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.seps.ticket.component.CommonHelper;
import com.seps.ticket.component.DateUtil;
import com.seps.ticket.component.EnumUtil;
import com.seps.ticket.config.Constants;
import com.seps.ticket.config.InstantTypeAdapter;
import com.seps.ticket.domain.Authority;
import com.seps.ticket.domain.ClaimTicket;
import com.seps.ticket.domain.User;
import com.seps.ticket.enums.excel.header.ExcelHeaderClaimTicketEnum;
import com.seps.ticket.enums.excel.header.ExcelHeaderClaimTicketSepsEnum;
import com.seps.ticket.repository.*;
import com.seps.ticket.security.AuthoritiesConstants;
import com.seps.ticket.service.dto.ClaimTicketListDTO;
import com.seps.ticket.domain.*;
import com.seps.ticket.enums.*;
import com.seps.ticket.service.dto.ClaimTicketResponseDTO;
import com.seps.ticket.service.dto.DropdownListAgentForTagDTO;
import com.seps.ticket.service.dto.*;
import com.seps.ticket.service.mapper.ClaimTicketMapper;
import com.seps.ticket.service.mapper.UserClaimTicketMapper;
import com.seps.ticket.service.specification.ClaimTicketSpecification;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import com.seps.ticket.web.rest.vm.*;
import com.seps.ticket.suptech.service.ExternalAPIService;
import com.seps.ticket.suptech.service.PersonNotFoundException;
import com.seps.ticket.suptech.service.dto.PersonInfoDTO;
import jakarta.validation.Valid;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.thymeleaf.context.Context;
import org.zalando.problem.Status;
import tech.jhipster.security.RandomUtil;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.*;

import static com.seps.ticket.component.CommonHelper.convertEntityToMap;

@Service
public class ClaimTicketService {

    private static final Logger LOG = LoggerFactory.getLogger(ClaimTicketService.class);

    private final ClaimTicketRepository claimTicketRepository;
    private final UserService userService;
    private final UserClaimTicketMapper userClaimTicketMapper;
    private final AuditLogService auditLogService;
    private final Gson gson;
    private final MessageSource messageSource;
    private final ClaimTicketMapper claimTicketMapper;
    private final ClaimTicketDocumentRepository claimTicketDocumentRepository;
    private final ClaimTicketStatusLogRepository claimTicketStatusLogRepository;
    private final ClaimTicketInstanceLogRepository claimTicketInstanceLogRepository;
    private final ClaimTicketPriorityLogRepository claimTicketPriorityLogRepository;
    private final EnumUtil enumUtil;
    private final UserRepository userRepository;
    private final ExternalAPIService externalAPIService;
    private final AuthorityRepository authorityRepository;
    private final PersonaRepository personaRepository;
    private final UserClaimTicketService userClaimTicketService;
    private final ClaimTicketOTPRepository claimTicketOTPRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClaimTicketActivityLogService claimTicketActivityLogService;
    private final NotificationService notificationService;
    private final TemplateVariableMappingService templateVariableMappingService;
    private final RoleService roleService;
    private final SurveyService surveyService;
    private final MailService mailService;
    private final TicketNumberService ticketNumberService;
    public ClaimTicketService(ClaimTicketRepository claimTicketRepository, UserService userService, UserClaimTicketMapper userClaimTicketMapper, AuditLogService auditLogService, Gson gson, MessageSource messageSource, ClaimTicketMapper claimTicketMapper, ClaimTicketDocumentRepository claimTicketDocumentRepository, ClaimTicketStatusLogRepository claimTicketStatusLogRepository, ClaimTicketInstanceLogRepository claimTicketInstanceLogRepository, ClaimTicketPriorityLogRepository claimTicketPriorityLogRepository, EnumUtil enumUtil, UserRepository userRepository, ExternalAPIService externalAPIService, AuthorityRepository authorityRepository, PersonaRepository personaRepository, UserClaimTicketService userClaimTicketService, ClaimTicketOTPRepository claimTicketOTPRepository, PasswordEncoder passwordEncoder, ClaimTicketActivityLogService claimTicketActivityLogService, NotificationService notificationService, TemplateVariableMappingService templateVariableMappingService, RoleService roleService, SurveyService surveyService, MailService mailService, TicketNumberService ticketNumberService) {
        this.claimTicketRepository = claimTicketRepository;
        this.userService = userService;
        this.userClaimTicketMapper = userClaimTicketMapper;
        this.auditLogService = auditLogService;
        this.externalAPIService = externalAPIService;
        this.authorityRepository = authorityRepository;
        this.personaRepository = personaRepository;
        this.userClaimTicketService = userClaimTicketService;
        this.claimTicketOTPRepository = claimTicketOTPRepository;
        this.passwordEncoder = passwordEncoder;
        this.claimTicketActivityLogService = claimTicketActivityLogService;
        this.notificationService = notificationService;
        this.templateVariableMappingService = templateVariableMappingService;
        this.roleService = roleService;
        this.surveyService = surveyService;
        this.mailService = mailService;
        this.ticketNumberService = ticketNumberService;
        this.gson = new GsonBuilder()
            .registerTypeAdapter(Instant.class, new InstantTypeAdapter())
            .create();
        this.messageSource = messageSource;
        this.claimTicketMapper = claimTicketMapper;
        this.claimTicketDocumentRepository = claimTicketDocumentRepository;
        this.claimTicketStatusLogRepository = claimTicketStatusLogRepository;
        this.claimTicketInstanceLogRepository = claimTicketInstanceLogRepository;
        this.claimTicketPriorityLogRepository = claimTicketPriorityLogRepository;
        this.enumUtil = enumUtil;
        this.userRepository = userRepository;
    }


    @Transactional
    public ClaimTicketResponseDTO createClaimTicket(@Valid CreateClaimTicketRequest claimTicketRequest, RequestInfo requestInfo) {
        String email = claimTicketRequest.getEmail();
        String identificacion = claimTicketRequest.getIdentificacion();

        User currentUser = userService.getCurrentUser();
        User claimUser = null;

        ClaimTicketResponseDTO responseDTO = new ClaimTicketResponseDTO();
        responseDTO.setCheckDuplicate(claimTicketRequest.getCheckDuplicate());

        //Fetch USER authority
        Authority userAuthority = authorityRepository.findById(AuthoritiesConstants.USER)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.AUTHORITY_NOT_FOUND, null, null));

        //Check if a user exists with the given identificacion and USER authority
        Set<Authority> authorities = new HashSet<>();
        authorities.add(userAuthority);
        User existUser = userRepository.findOneByIdentificacionAndAuthoritiesIn(identificacion, authorities).orElse(null);

        if (existUser != null) {
            email = existUser.getEmail();
        }

        LOG.debug("otpEmail:{}", email);

        ClaimTicketOTP otpEntity = claimTicketOTPRepository.findOneByEmailIgnoreCase(email)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_OTP_CODE, null, null));

        //MATCH OTP Code
        if (!otpEntity.getOtpCode().equals(claimTicketRequest.getOtpCode())) {
            LOG.error("OTP code is not matched");
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_OTP_CODE, null, null);
        }

        //Check OTP Expiration
        if (otpEntity.getExpiryTime().isBefore(Instant.now())) {
            LOG.error("OTP code is expired");
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_OTP_CODE, null, null);
        }

        //Check OTP Used
        if (!otpEntity.isUsed()) {
            LOG.error("Email not verified :{}", email);
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.EMAIL_NOT_VERIFIED, null, null);
        }

        // Check for duplicate tickets if requested
        if (Boolean.TRUE.equals(claimTicketRequest.getCheckDuplicate()) && existUser != null) {
            ClaimTicket duplicateTicket = findDuplicateTicket(claimTicketRequest, existUser.getId());
            if (duplicateTicket != null) {
                responseDTO.setFoundDuplicate(true);
                responseDTO.setDuplicateTicketId(duplicateTicket.getFormattedTicketId());
                return responseDTO;
            }
        }

        // Fetch and validate associated entities
        Province province = userClaimTicketService.findProvince(claimTicketRequest.getProvinceId());
        City city = userClaimTicketService.findCity(claimTicketRequest.getCityId(), claimTicketRequest.getProvinceId());
        Long organizationId = resolveOrganizationId(claimTicketRequest.getOrganizationId(), currentUser);
        Organization organization = userClaimTicketService.findOrganization(organizationId);
        ClaimType claimType = userClaimTicketService.findClaimType(claimTicketRequest.getClaimTypeId());
        ClaimSubType claimSubType = userClaimTicketService.findClaimSubType(claimTicketRequest.getClaimSubTypeId(), claimTicketRequest.getClaimTypeId());

        // Validate user account if a user exists
        if (existUser != null) {
            validateClaimTicketUserAccount(existUser);
            claimUser = existUser;
        } else {
            //new user registration
            userRepository
                .findOneByEmailIgnoreCase(email)
                .ifPresent(existingUser -> {
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.EMAIL_ALREADY_USED, null, null);
                });

            userRepository
                .findOneByIdentificacionAndAuthoritiesIn(identificacion, authorities)
                .ifPresent(existingUser -> {
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_IDENTIFICATION_ALREADY_EXIST, new String[]{identificacion}, null);
                });

            //Get Persona info
            Persona persona = getPersonaByIdentificacion(identificacion);

            String normalizeEmail = email.toLowerCase();
            User newUser = new User();
            String encryptedPassword = passwordEncoder.encode(RandomUtil.generatePassword());
            newUser.setLogin(normalizeEmail);
            // new user gets initially a generated password
            newUser.setPassword(encryptedPassword);
            newUser.setFirstName(persona.getNombreCompleto());
            newUser.setDateOfBirth(persona.getFechaNacimiento());
            newUser.setEmail(normalizeEmail);
            newUser.setLangKey(Constants.DEFAULT_LANGUAGE);
            newUser.setActivated(true);
            newUser.setCountryCode(claimTicketRequest.getCountryCode());
            newUser.setPhoneNumber(claimTicketRequest.getPhoneNumber());
            newUser.setStatus(UserStatusEnum.ACTIVE);
            newUser.setPasswordSet(false);
            newUser.setIdentificacion(identificacion);
            newUser.setGender(persona.getGenero());
            newUser.setFingerprintVerified(false);
            //Set Authorities
            newUser.setAuthorities(authorities);
            userRepository.save(newUser);
            LOG.debug("Created Information for Registered User: {}", newUser);
            claimUser = newUser;
        }

        // Create and save the new claim ticket
        ClaimTicket newClaimTicket = createClaimTicket(claimTicketRequest, claimUser, province, city, organization,
            claimType, claimSubType, currentUser);

        claimTicketRepository.save(newClaimTicket);


        // Handle attachments and save documents
        DocumentSourceEnum source = DocumentSourceEnum.FILE_A_CLAIM;
        List<ClaimTicketDocument> claimTicketDocuments = userClaimTicketService.uploadFileAttachments(claimTicketRequest.getAttachments(), newClaimTicket,
            currentUser, source);
        // Save documents if any were uploaded
        if (!claimTicketDocuments.isEmpty()) {
            claimTicketDocumentRepository.saveAll(claimTicketDocuments);
        }

        // Log all claim ticket-related information
        logClaimTicketDetails(newClaimTicket, currentUser.getId());

        //Delete Claim OTP Entry
        claimTicketOTPRepository.deleteByEmail(email);

        // Populate response
        responseDTO.setNewTicketId(newClaimTicket.getFormattedTicketId());
        responseDTO.setNewId(newClaimTicket.getId());
        responseDTO.setEmail(claimUser.getEmail());
        responseDTO.setFoundDuplicate(false);

        // Log activity and audit
        newClaimTicket.setClaimTicketDocuments(claimTicketDocuments);
        logAudit(newClaimTicket, claimTicketRequest, requestInfo, currentUser);

        return responseDTO;
    }

    /**
     * Retrieves a combined list of SEPS users and FI users associated with a specific claim ticket
     * and maps them into `DropdownListAgentForTagDTO` objects.
     *
     * @param ticketId the ID of the claim ticket for which the agent list needs to be retrieved.
     * @return a list of `DropdownListAgentForTagDTO` objects containing the details of SEPS users and FI users.
     * @throws CustomException if the claim ticket is not found for the given ticket ID or
     *                         if the user does not have the necessary authority.
     */
    @Transactional
    public List<DropdownListAgentForTagDTO> getAgentListForTagging(Long ticketId) {
        User currentUser = userService.getCurrentUser();

        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();

        // Find the ticket by ID
        ClaimTicket ticket;
        if (authority.contains(AuthoritiesConstants.FI)) {
            Long organizationId = currentUser.getOrganization().getId();
            ticket = claimTicketRepository.findByIdAndOrganizationId(ticketId, organizationId)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        } else {
            ticket = claimTicketRepository.findById(ticketId)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        }

        List<User> sepsUsers = userService.getUserListBySepsUser();
        List<User> fiUsers = userService.getUserListByOrganizationIdFI(ticket.getOrganizationId());

        // Combine the lists and map them to DTOs
        return Stream.concat(sepsUsers.stream(), fiUsers.stream())
            .map(user -> new DropdownListAgentForTagDTO(
                user.getId(),
                user.getFirstName(),
                user.getEmail()
            ))
            .distinct() // Optional: Remove duplicates if necessary
            .toList();
    }

    /**
     * Retrieves a paginated list of claim tickets for SEPS and FI users that are tagged to the current user.
     *
     * <p>This method applies filters based on the provided {@link ClaimTicketFilterRequest}
     * and the current user's role and organization. If no filter request is provided,
     * a default filter is initialized. The method ensures that FI users are restricted
     * to claim tickets within their organization.
     *
     * <p>The claim tickets are fetched using a custom specification that matches the
     * "tagged to user" criteria, and the result mapped to {@link ClaimTicketListDTO}.
     *
     * @param pageable      the pagination and sorting information
     * @param filterRequest the filter criteria for claim tickets; if null, a default filter is used
     * @return a {@link Page} of {@link ClaimTicketListDTO} containing the filtered claim tickets
     */
    @Transactional(readOnly = true)
    public Page<ClaimTicketListDTO> listSepsAndFiClaimTicketsForTaggedUser(Pageable pageable, ClaimTicketFilterRequest filterRequest) {

        // If no filterRequest is provided, initialize a default object
        if (filterRequest == null) {
            filterRequest = new ClaimTicketFilterRequest();
        }

        User currentUser = userService.getCurrentUser();

        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();

        if (authority.contains(AuthoritiesConstants.FI)) {
            filterRequest.setOrganizationId(currentUser.getOrganization().getId());
        }

        return claimTicketRepository.findAll(ClaimTicketSpecification.taggedToUser(filterRequest, currentUser.getId()), pageable)
            .map(claimTicketMapper::toListDTO);
    }

    private ClaimTicket findDuplicateTicket(CreateClaimTicketRequest claimTicketRequest, Long userId) {
        List<ClaimTicket> duplicateTickets = claimTicketRepository.findByUserIdAndClaimTypeIdAndClaimSubTypeIdAndOrganizationId(userId,
            claimTicketRequest.getClaimTypeId(), claimTicketRequest.getClaimSubTypeId(), claimTicketRequest.getOrganizationId());
        return duplicateTickets.stream().findAny().orElse(null);
    }

    private ClaimTicket createClaimTicket(CreateClaimTicketRequest claimTicketRequest, User user, Province province,
                                          City city, Organization organization, ClaimType claimType, ClaimSubType claimSubType,
                                          User currentUser) {
        ClaimTicket newClaimTicket = new ClaimTicket();
        newClaimTicket.setTicketId(userClaimTicketService.generateTicketId());
        newClaimTicket.setUser(user);
        newClaimTicket.setProvince(province);
        newClaimTicket.setCity(city);
        newClaimTicket.setOrganization(organization);
        newClaimTicket.setClaimType(claimType);
        newClaimTicket.setClaimSubType(claimSubType);
        newClaimTicket.setPriorityCareGroup(claimTicketRequest.getPriorityCareGroup());
        newClaimTicket.setCustomerType(claimTicketRequest.getCustomerType());
        newClaimTicket.setPrecedents(claimTicketRequest.getPrecedents());
        newClaimTicket.setSpecificPetition(claimTicketRequest.getSpecificPetition());
        newClaimTicket.setPriority(ClaimTicketPriorityEnum.MEDIUM);
        newClaimTicket.setSlaBreachDays(claimSubType.getSlaBreachDays());
        newClaimTicket.setInstanceType(InstanceTypeEnum.FIRST_INSTANCE);
        newClaimTicket.setStatus(ClaimTicketStatusEnum.NEW);
        newClaimTicket.setCreatedByUser(currentUser);
        newClaimTicket.setChannelOfEntry(claimTicketRequest.getChannelOfEntry());
        newClaimTicket.setSource(SourceEnum.AGENT);
        newClaimTicket.setCanCreateInstance(true);
        return newClaimTicket;
    }

    private void logClaimTicketDetails(ClaimTicket claimTicket, Long currentUserId) {
        // Log claim ticket status
        ClaimTicketStatusLog claimTicketStatusLog = new ClaimTicketStatusLog();
        claimTicketStatusLog.setTicketId(claimTicket.getId());
        claimTicketStatusLog.setStatus(claimTicket.getStatus());
        claimTicketStatusLog.setCreatedBy(currentUserId);
        claimTicketStatusLog.setInstanceType(claimTicket.getInstanceType());
        claimTicketStatusLogRepository.save(claimTicketStatusLog);

        // Log claim ticket instance
        ClaimTicketInstanceLog claimTicketInstanceLog = new ClaimTicketInstanceLog();
        claimTicketInstanceLog.setTicketId(claimTicket.getId());
        claimTicketInstanceLog.setInstanceType(claimTicket.getInstanceType());
        claimTicketInstanceLog.setCreatedBy(currentUserId);
        claimTicketInstanceLogRepository.save(claimTicketInstanceLog);

        // Log claim ticket priority
        ClaimTicketPriorityLog claimTicketPriorityLog = new ClaimTicketPriorityLog();
        claimTicketPriorityLog.setTicketId(claimTicket.getId());
        claimTicketPriorityLog.setCreatedBy(currentUserId);
        claimTicketPriorityLog.setPriority(claimTicket.getPriority());
        claimTicketPriorityLog.setInstanceType(claimTicket.getInstanceType());
        claimTicketPriorityLogRepository.save(claimTicketPriorityLog);
    }


    /**
     * Logs the activity and audit messages for the filed claim ticket.
     */
    private void logAudit(ClaimTicket newClaimTicket, CreateClaimTicketRequest claimTicketRequest, RequestInfo requestInfo, User currentUser) {
        Map<String, String> auditMessageMap = new HashMap<>();
        Map<String, Object> auditData = new HashMap<>();
        String plainTicketId = newClaimTicket.getFormattedTicketId();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String auditMessage = messageSource.getMessage("audit.log.claim.ticket.created",
                new Object[]{currentUser.getEmail(), plainTicketId}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), auditMessage);
        });
        UserClaimTicketDTO userClaimTicketDTO = userClaimTicketMapper.toUserClaimTicketDTO(newClaimTicket);
        ClaimTicketDTO claimTicketDTO = claimTicketMapper.toDTO(newClaimTicket);
        auditData.put(Constants.NEW_DATA, convertEntityToMap(claimTicketDTO));
        // Convert ClaimTicketRequest to ClaimTicketRequestJson using the new method
        CreateClaimTicketRequestForJson claimTicketRequestJson = convertToClaimTicketRequestJson(claimTicketRequest);
        // Convert the ClaimTicketRequestJson object to JSON string using Gson
        Gson gson = new Gson();
        String requestBody = gson.toJson(claimTicketRequestJson);  // Convert ClaimTicketRequestJson to JSON
        // Audit Log
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "createClaimTicket",
            ActionTypeEnum.CLAIM_TICKET_ADD.name(), newClaimTicket.getId(), ClaimTicket.class.getSimpleName(),
            null, auditMessageMap, auditData, ActivityTypeEnum.DATA_ENTRY.name(), requestBody);
    }

    private CreateClaimTicketRequestForJson convertToClaimTicketRequestJson(CreateClaimTicketRequest claimTicketRequest) {
        // Create a new ClaimTicketRequestJson object
        CreateClaimTicketRequestForJson claimTicketRequestJson = new CreateClaimTicketRequestForJson();
        // Map properties from ClaimTicketRequest to ClaimTicketRequestJson
        claimTicketRequestJson.setIdentificacion(claimTicketRequest.getIdentificacion());
        claimTicketRequestJson.setEmail(claimTicketRequest.getEmail());
        claimTicketRequestJson.setName(claimTicketRequest.getName());
        claimTicketRequestJson.setGender(claimTicketRequest.getGender());
        claimTicketRequestJson.setCountryCode(claimTicketRequest.getCountryCode());
        claimTicketRequestJson.setPhoneNumber(claimTicketRequest.getPhoneNumber());
        claimTicketRequestJson.setProvinceId(claimTicketRequest.getProvinceId());
        claimTicketRequestJson.setCityId(claimTicketRequest.getCityId());
        claimTicketRequestJson.setPriorityCareGroup(claimTicketRequest.getPriorityCareGroup());
        claimTicketRequestJson.setCustomerType(claimTicketRequest.getCustomerType());
        claimTicketRequestJson.setOrganizationId(claimTicketRequest.getOrganizationId());
        claimTicketRequestJson.setClaimTypeId(claimTicketRequest.getClaimTypeId());
        claimTicketRequestJson.setClaimSubTypeId(claimTicketRequest.getClaimSubTypeId());
        claimTicketRequestJson.setPrecedents(claimTicketRequest.getPrecedents());
        claimTicketRequestJson.setSpecificPetition(claimTicketRequest.getSpecificPetition());
        claimTicketRequestJson.setCheckDuplicate(claimTicketRequest.getCheckDuplicate());
        // Convert attachments (MultipartFile to filenames)
        List<String> attachments = new ArrayList<>();
        if (claimTicketRequest.getAttachments() != null) {
            for (MultipartFile file : claimTicketRequest.getAttachments()) {
                attachments.add(file.getOriginalFilename());  // Add only file name to the list
            }
        }
        claimTicketRequestJson.setAttachments(attachments);
        return claimTicketRequestJson;
    }


    @Transactional
    public PersonInfoDTO validateClaimTicketIdentificacion(String identificacion) {
        // Step 1: Fetch USER authority
        Authority userAuthority = authorityRepository.findById(AuthoritiesConstants.USER)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.AUTHORITY_NOT_FOUND, null, null));
        // Step 2: Check if a user exists with the given identificacion and USER authority
        Set<Authority> authorities = new HashSet<>();
        authorities.add(userAuthority);
        User existUser = userRepository.findOneByIdentificacionAndAuthoritiesIn(identificacion, authorities).orElse(null);
        // Step 3: Validate user account if a user exists
        if (existUser != null) {
            validateClaimTicketUserAccount(existUser);
        }
        try {
            // Step 4: Fetch person info from the external API
            PersonInfoDTO personInfoDTO = externalAPIService.getPersonInfo(identificacion);
            // Step 5: Check if Persona exists in the local database, otherwise save it
            Optional<Persona> optionalPersona = personaRepository.findByIdentificacion(identificacion);
            if (!optionalPersona.isPresent()) {
                Persona persona = new Persona();
                persona.setIdentificacion(identificacion);
                persona.setNombreCompleto(personInfoDTO.getNombreCompleto());
                persona.setGenero(personInfoDTO.getGenero());
                persona.setLugarNacimiento(personInfoDTO.getLugarNacimiento());
                persona.setNacionalidad(personInfoDTO.getNacionalidad());
                persona.setFechaNacimiento(personInfoDTO.getFechaNacimiento());
                personaRepository.save(persona);
            }
            // Step 6: Add the user's email to the DTO if the user exists
            if (existUser != null) {
                personInfoDTO.setExistUserEmail(existUser.getEmail());
            }

            return personInfoDTO;
        } catch (PersonNotFoundException e) {
            // Step 7: Handle person not found exception
            throw new CustomException(Status.NOT_FOUND, SepsStatusCode.PERSON_NOT_FOUND, new String[]{identificacion}, null);
        }
    }


    @Transactional(readOnly = true)
    public Boolean validateClaimTicketUserEmail(String email) {
        Authority userAuthority = authorityRepository.findById(AuthoritiesConstants.USER)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.AUTHORITY_NOT_FOUND, null, null));
        boolean isInvalidUser = userRepository.existsByEmailIgnoreCaseAndAuthoritiesNotContaining(email, userAuthority);
        if (isInvalidUser) {
            LOG.warn("Invalid user email :{} for claim ", email);
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_USER_EMAIL_FOR_CLAIM, null, null);
        }
        return true;
    }


    private void validateClaimTicketUserAccount(User user) {
        String username = user.getLogin();
        if (!user.isActivated()) {
            LOG.warn("User {} account is not activated", username);
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_ACCOUNT_NOT_ACTIVE, null, null);
        }
        UserStatusEnum userStatus = user.getStatus();
        if (userStatus.equals(UserStatusEnum.PENDING)) {
            LOG.warn("User {} account is pending", username);
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_ACCOUNT_STATUS_PENDING, null, null);
        } else if (userStatus.equals(UserStatusEnum.BLOCKED)) {
            LOG.warn("User {} account is blocked", username);
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_ACCOUNT_STATUS_BLOCKED, null, null);
        } else if (userStatus.equals(UserStatusEnum.DELETED)) {
            LOG.warn("User {} account is deleted", username);
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_ACCOUNT_STATUS_DELETED, null, null);
        }
    }

    /**
     * Resolves the organization ID for the current user based on their authorities.
     *
     * @param organizationId The ID of the organization provided in the request.
     * @param currentUser    The current logged-in user.
     * @return The resolved organization ID.
     */
    private Long resolveOrganizationId(Long organizationId, User currentUser) {
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        if (authority.contains(AuthoritiesConstants.FI)) {
            organizationId = currentUser.getOrganizationId();
        }
        return organizationId;
    }


    @Transactional
    public Persona getPersonaByIdentificacion(String identificacion) {
        return personaRepository.findByIdentificacion(identificacion)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.PERSON_NOT_FOUND,
                new String[]{identificacion}, null));
    }

    @Transactional(readOnly = true)
    public UserClaimTicketDTO getUserClaimTicketById(Long id) {
        return claimTicketRepository.findById(id)
            .map(userClaimTicketMapper::toUserClaimTicketDTO)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                new String[]{id.toString()}, null));
    }

    @Transactional(readOnly = true)
    public ByteArrayInputStream getDownloadClaimAndComplaintsData(ClaimTicketFilterRequest filterRequest) throws IOException {
        // If no filterRequest is provided, initialize a default object
        if (filterRequest == null) {
            filterRequest = new ClaimTicketFilterRequest();
        }
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        Long fiAgentId = null;
        Long sepsAgentId = null;
        boolean isSeps = true;
        if (authority.contains(AuthoritiesConstants.FI)) {
            Set<Permission> permissetSet = roleService.getUserPermissions(currentUser.getId(), "TICKET_VIEW_ALL_FI");
            filterRequest.setOrganizationId(currentUser.getOrganization().getId());
            if (!currentUser.hasRoleSlug(Constants.RIGHTS_FI_ADMIN) && permissetSet.isEmpty()) {
                fiAgentId = currentUser.getId();
            }
            isSeps = false;
            filterRequest.setInstanceType(InstanceTypeEnum.FIRST_INSTANCE);
        } else{
            Set<Permission> permissetSet = roleService.getUserPermissions(currentUser.getId(), "TICKET_VIEW_ALL_SEPS");
            if (authority.contains(AuthoritiesConstants.SEPS) && !currentUser.hasRoleSlug(Constants.RIGHTS_SEPS_ADMIN) && permissetSet.isEmpty()) {
                sepsAgentId = currentUser.getId();
            }
        }

        List<ClaimTicketListDTO> claimAndComplaintsList = claimTicketRepository.findAll(ClaimTicketSpecification.bySepsFiFilter(filterRequest, fiAgentId, sepsAgentId)).stream()
            .map(claimTicketMapper::toListDTO).toList();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Claim and Complaints");

            if(isSeps){
                sepsReportExportDashboard(sheet, claimAndComplaintsList);
            }else {
                fiReportExportDashboard(sheet, claimAndComplaintsList);
            }
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    private void fiReportExportDashboard(Sheet sheet, List<ClaimTicketListDTO> claimAndComplaintsList) {
        // Header
        Row headerRow = sheet.createRow(0);

        for (ExcelHeaderClaimTicketEnum header : ExcelHeaderClaimTicketEnum.values()) {
            // Use ordinal() to determine the column index
            Cell cell = headerRow.createCell(header.ordinal());
            cell.setCellValue(enumUtil.getLocalizedEnumValue(header, LocaleContextHolder.getLocale()));
        }
        // Data
        int rowIdx = 1;
        for (ClaimTicketListDTO data : claimAndComplaintsList) {
            Row row = sheet.createRow(rowIdx++);

            row.createCell(ExcelHeaderClaimTicketEnum.ID.ordinal()).setCellValue(data.getId());
            row.createCell(ExcelHeaderClaimTicketEnum.TICKET_ID.ordinal()).setCellValue(data.getFormattedTicketId());
            row.createCell(ExcelHeaderClaimTicketEnum.CLAIM_TYPE.ordinal()).setCellValue(data.getClaimType().getName());
            row.createCell(ExcelHeaderClaimTicketEnum.CLAIM_SUB_TYPE.ordinal()).setCellValue(data.getClaimSubType().getName());
            row.createCell(ExcelHeaderClaimTicketEnum.SLA_DATE.ordinal()).setCellValue(DateUtil.formatDate(data.getSlaBreachDate(), LocaleContextHolder.getLocale().getLanguage()));
            row.createCell(ExcelHeaderClaimTicketEnum.STATUS.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getStatus(), LocaleContextHolder.getLocale()));
            row.createCell(ExcelHeaderClaimTicketEnum.CUSTOMER_NAME.ordinal()).setCellValue(data.getUser() != null ? data.getUser().getName() : "");
            row.createCell(ExcelHeaderClaimTicketEnum.FI_AGENT.ordinal()).setCellValue(data.getFiAgent() != null ? data.getFiAgent().getName() : "");
            row.createCell(ExcelHeaderClaimTicketEnum.INSTANCE_TYPE.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getInstanceType(), LocaleContextHolder.getLocale()));
            row.createCell(ExcelHeaderClaimTicketEnum.CREATED_AT.ordinal()).setCellValue(DateUtil.formatDate(data.getCreatedAt(), LocaleContextHolder.getLocale().getLanguage()));
            row.createCell(ExcelHeaderClaimTicketEnum.CLAIM_AMOUNT.ordinal()).setCellValue(CommonHelper.formatAmount(data.getClaimAmount()));


        }
        // Auto-size columns
        for (ExcelHeaderClaimTicketEnum header : ExcelHeaderClaimTicketEnum.values()) {
            sheet.autoSizeColumn(header.ordinal());
        }
    }

    private void sepsReportExportDashboard(Sheet sheet, List<ClaimTicketListDTO> claimAndComplaintsList) {
        // Header
        Row headerRow = sheet.createRow(0);

        for (ExcelHeaderClaimTicketSepsEnum header : ExcelHeaderClaimTicketSepsEnum.values()) {
            // Use ordinal() to determine the column index
            Cell cell = headerRow.createCell(header.ordinal());
            cell.setCellValue(enumUtil.getLocalizedEnumValue(header, LocaleContextHolder.getLocale()));
        }
        // Data
        int rowIdx = 1;
        for (ClaimTicketListDTO data : claimAndComplaintsList) {
            Row row = sheet.createRow(rowIdx++);

            row.createCell(ExcelHeaderClaimTicketSepsEnum.ID.ordinal()).setCellValue(data.getId());
            row.createCell(ExcelHeaderClaimTicketSepsEnum.TICKET_ID.ordinal()).setCellValue(data.getFormattedTicketId());
            row.createCell(ExcelHeaderClaimTicketSepsEnum.CLAIM_TYPE.ordinal()).setCellValue(data.getClaimType().getName());
            row.createCell(ExcelHeaderClaimTicketSepsEnum.CLAIM_SUB_TYPE.ordinal()).setCellValue(data.getClaimSubType().getName());
            row.createCell(ExcelHeaderClaimTicketSepsEnum.FI_ENTITY.ordinal()).setCellValue(data.getOrganization().getRazonSocial());
            row.createCell(ExcelHeaderClaimTicketSepsEnum.SLA_DATE.ordinal()).setCellValue(DateUtil.formatDate(data.getSlaBreachDate(), LocaleContextHolder.getLocale().getLanguage()));
            row.createCell(ExcelHeaderClaimTicketSepsEnum.STATUS.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getStatus(), LocaleContextHolder.getLocale()));
            row.createCell(ExcelHeaderClaimTicketSepsEnum.CUSTOMER_NAME.ordinal()).setCellValue(data.getUser() != null ? data.getUser().getName() : "");
            row.createCell(ExcelHeaderClaimTicketSepsEnum.FI_AGENT.ordinal()).setCellValue(data.getFiAgent() != null ? data.getFiAgent().getName() : "");
            row.createCell(ExcelHeaderClaimTicketSepsEnum.SEPS_AGENT.ordinal()).setCellValue(data.getSepsAgent() != null ? data.getSepsAgent().getName() : "");
            row.createCell(ExcelHeaderClaimTicketSepsEnum.INSTANCE_TYPE.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getInstanceType(), LocaleContextHolder.getLocale()));
            row.createCell(ExcelHeaderClaimTicketSepsEnum.CREATED_AT.ordinal()).setCellValue(DateUtil.formatDate(data.getCreatedAt(), LocaleContextHolder.getLocale().getLanguage()));
            row.createCell(ExcelHeaderClaimTicketSepsEnum.CLAIM_AMOUNT.ordinal()).setCellValue(CommonHelper.formatAmount(data.getClaimAmount()));
            if(data.getPreviousTicketId()!=null) {
                ClaimTicket previousClaim = claimTicketRepository.findById(data.getPreviousTicketId()).orElse(null);
                row.createCell(ExcelHeaderClaimTicketSepsEnum.REFERENCE_TICKET_ID.ordinal()).setCellValue(previousClaim!=null ? previousClaim.getFormattedTicketId() : "");
            }else{
                row.createCell(ExcelHeaderClaimTicketSepsEnum.REFERENCE_TICKET_ID.ordinal()).setCellValue("");
            }
        }
        // Auto-size columns
        for (ExcelHeaderClaimTicketSepsEnum header : ExcelHeaderClaimTicketSepsEnum.values()) {
            sheet.autoSizeColumn(header.ordinal());
        }
    }

    @Transactional
    public ClaimTicketDTO getSepsFiClaimTicketById(Long id) {
        return claimTicketRepository.findById(id)
            .map(claimTicketMapper::toDTO)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                new String[]{id.toString()}, null));
    }

    /**
     * Saves an SLA comment for a claim ticket. This method determines the type of ticket (First Instance,
     * Second Instance, or Complaint) and updates the corresponding SLA comment fields. It also clears the SLA
     * popup flag and logs the activity in the audit log.
     *
     * @param ticketId                     the ID of the claim ticket
     * @param claimTicketSlaCommentRequest the request body containing the SLA comment
     * @param requestInfo                  the request information including headers and metadata
     * @throws CustomException if the claim ticket is not found, the user does not have permission,
     *                         or the SLA popup flag is null
     */
    @Transactional
    public void saveSlaComment(Long ticketId, @Valid ClaimTicketSlaCommentRequest claimTicketSlaCommentRequest, RequestInfo requestInfo) {
        User currentUser = userService.getCurrentUser();

        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();

        // Find the ticket by ID
        ClaimTicket ticket;
        if (authority.contains(AuthoritiesConstants.FI)) {
            Long organizationId = currentUser.getOrganization().getId();
            ticket = claimTicketRepository.findByIdAndOrganizationId(ticketId, organizationId)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        } else {
            ticket = claimTicketRepository.findById(ticketId)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        }
        if (ticket.getSlaPopup() == null) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.YOU_NOT_AUTHORIZED_TO_PERFORM, null, null);
        }
        Map<String, Object> oldData = convertEntityToMap(this.getSepsFiClaimTicketById(ticketId));
        ticket.setSlaComment(claimTicketSlaCommentRequest.getSlaComment());
        ticket.setSlaCommentedAt(Instant.now());
        ticket.setSlaCommentedByUser(currentUser);
        ticket.setSlaPopup(null);
        ClaimTicket savedTicket = claimTicketRepository.save(ticket);

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.ticket.sla.comment",
                new Object[]{currentUser.getEmail(), ticket.getFormattedTicketId(), claimTicketSlaCommentRequest.getSlaComment()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });

        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getSepsFiClaimTicketById(savedTicket.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        String requestBody = gson.toJson(claimTicketSlaCommentRequest);
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "saveSlaComment", ActionTypeEnum.CLAIM_TICKET_SLA_COMMENTED.name(), savedTicket.getId(), ClaimTicket.class.getSimpleName(),
            null, auditMessageMap, entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);
    }

    /**
     * Dismisses the SLA popup for a claim ticket. This method verifies the user's authority and ensures
     * that the SLA popup flag is true before dismissing it. Updates the SLA popup flag to false.
     *
     * @param ticketId the ID of the claim ticket
     * @throws CustomException if the claim ticket is not found or the SLA popup flag is not true
     */
    @Transactional
    public void dismissalSLACommentPopup(Long ticketId) {
        User currentUser = userService.getCurrentUser();

        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();

        // Find the ticket by ID
        ClaimTicket ticket;
        if (authority.contains(AuthoritiesConstants.FI)) {
            Long organizationId = currentUser.getOrganization().getId();
            ticket = claimTicketRepository.findByIdAndOrganizationId(ticketId, organizationId)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        } else {
            ticket = claimTicketRepository.findById(ticketId)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        }
        ticket.setSlaPopup(false);
        claimTicketRepository.save(ticket);
    }

    @Transactional
    public void updateClaimTicketDetails(Long ticketId, @Valid ClaimTicketUpdateRequest claimTicketUpdateRequest, RequestInfo requestInfo) {
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        // Find the ticket by ID
        ClaimTicket ticket;

        InstanceTypeEnum instanceType = InstanceTypeEnum.FIRST_INSTANCE;
        List<ClaimTicketStatusEnum> statusList = new ArrayList<>();
        statusList.add(ClaimTicketStatusEnum.CLOSED);
        statusList.add(ClaimTicketStatusEnum.REJECTED);

        if (authority.contains(AuthoritiesConstants.FI)) {
            Long organizationId = currentUser.getOrganization().getId();
            ticket = claimTicketRepository.findByIdAndOrganizationIdAndInstanceTypeAndStatusNotIn(ticketId, organizationId, instanceType, statusList)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        } else {
            ticket = claimTicketRepository.findByIdAndInstanceTypeAndStatusNotIn(ticketId, instanceType, statusList)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        }

        ClaimType claimType = userClaimTicketService.findClaimType(claimTicketUpdateRequest.getClaimTypeId());
        ClaimSubType claimSubType = userClaimTicketService.findClaimSubType(claimTicketUpdateRequest.getClaimSubTypeId(), claimTicketUpdateRequest.getClaimTypeId());

        Map<String, Object> oldData = convertEntityToMap(this.getSepsFiClaimTicketById(ticketId));

        ticket.setClaimType(claimType);
        ticket.setClaimSubType(claimSubType);
        ticket.setPriorityCareGroup(claimTicketUpdateRequest.getPriorityCareGroup());
        ticket.setCustomerType(claimTicketUpdateRequest.getCustomerType());
        ticket.setUpdatedByUser(currentUser);

        ClaimTicket savedTicket = claimTicketRepository.save(ticket);

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.claim.ticket.update",
                new Object[]{currentUser.getEmail(), ticket.getFormattedTicketId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });

        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getSepsFiClaimTicketById(savedTicket.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        String requestBody = gson.toJson(claimTicketUpdateRequest);
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "updateClaimTicketDetails", ActionTypeEnum.CLAIM_TICKET_UPDATE.name(),
            savedTicket.getId(), ClaimTicket.class.getSimpleName(), null, auditMessageMap, entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);

    }

    @Transactional
    public Context getTicketDetailContext(Long ticketId, RequestInfo requestInfo) throws IOException {
        User currentUser = userService.getCurrentUser();

        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();

        // Find the ticket by ID
        ClaimTicket ticket;
        if (authority.contains(AuthoritiesConstants.FI)) {
            Long organizationId = currentUser.getOrganization().getId();
            ticket = claimTicketRepository.findByIdAndOrganizationId(ticketId, organizationId)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        } else {
            ticket = claimTicketRepository.findById(ticketId)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        }
        Context context = new Context(LocaleContextHolder.getLocale());
        ClaimTicketDTO claim = claimTicketMapper.toDTO(ticket);

        ClaimTicketDTO firstClaim = null;
        ClaimTicketDTO secondClaim = null;
        ClaimTicketDTO complaintClaim = null;
        Map<String, Object> firstInstance = new HashMap<>();
        Map<String, Object> secondInstance = new HashMap<>();
        Map<String, Object> complaint = new HashMap<>();

        context.setVariable("ticket", claim);

        if (claim.getInstanceType().equals(InstanceTypeEnum.FIRST_INSTANCE)) {
            firstClaim = claim;
        } else if (claim.getInstanceType().equals(InstanceTypeEnum.SECOND_INSTANCE)) {
            secondClaim = claim;
            if (claim.getPreviousTicket() != null) {
                firstClaim = claim.getPreviousTicket();
            }
        } else if (claim.getInstanceType().equals(InstanceTypeEnum.COMPLAINT)) {
            complaintClaim = claim;
            if (claim.getPreviousTicket() != null) {
                secondClaim = claim.getPreviousTicket();
                if (secondClaim.getPreviousTicket() != null) {
                    firstClaim = secondClaim.getPreviousTicket();
                }
            }
        }

        if (firstClaim != null) {
            setTicketDataForPDF(firstInstance, firstClaim);
        }
        if (secondClaim != null) {
            setTicketDataForPDF(secondInstance, secondClaim);
        }
        if (complaintClaim != null) {
            setTicketDataForPDF(complaint, complaintClaim);
        }
        context.setVariable("firstClaim", firstClaim);
        context.setVariable("secondClaim", secondClaim);
        context.setVariable("complaintClaim", complaintClaim);

        context.setVariable("firstInstance", firstInstance);
        context.setVariable("secondInstance", secondInstance);
        context.setVariable("complaint", complaint);

        String imagePath = encodeImageToBase64("static/images/logo.png");
        context.setVariable("logo", "data:image/png;base64," + imagePath);

        // Convert calendar_today.png to Base64
        String calenderPath = encodeImageToBase64("static/images/calendar_today.png");
        context.setVariable("calenderPath", "data:image/png;base64," + calenderPath);

        return context;

    }

    private void setTicketDataForPDF(Map<String, Object> complaint, ClaimTicketDTO complaintClaim) {
        complaint.put("claimId", complaintClaim.getFormattedTicketId());
        complaint.put("createdDate", DateUtil.formatDate(complaintClaim.getCreatedAt(), LocaleContextHolder.getLocale().getLanguage()));
        complaint.put("resolveOnDate", DateUtil.formatDate(complaintClaim.getResolvedOn(), LocaleContextHolder.getLocale().getLanguage()));
        complaint.put("instanceType", enumUtil.getLocalizedEnumValue(complaintClaim.getInstanceType(), LocaleContextHolder.getLocale()));
        complaint.put("closedStatus", enumUtil.getLocalizedEnumValue(complaintClaim.getClosedStatus(), LocaleContextHolder.getLocale()));
        complaint.put("previousTicket", complaintClaim.getPreviousTicket() != null ? "#"+ complaintClaim.getPreviousTicket().getFormattedTicketId(): "");
        complaint.put("statusComment", complaintClaim.getStatusComment() != null ? complaintClaim.getStatusComment() : "");
        List<HashMap<String, Object>> complaintClaimConversion = getConversionActivity(complaintClaim);
        complaint.put("conversation", complaintClaimConversion);
    }

    private List<HashMap<String, Object>> getConversionActivity(ClaimTicketDTO ticket) {
        List<ClaimTicketActivityLogDTO> activity = claimTicketActivityLogService.getAllActivities(ticket.getId());
        List<HashMap<String,Object>> complaintClaimConversion = new ArrayList<>();
        if(!activity.isEmpty()){
            activity.forEach(data->{
                HashMap<String, Object> chat = new HashMap<>();
                String activityTitle = data.getActivityTitle();
                Map<String, String> linkedUsers = data.getLinkedUsers();

                if (linkedUsers != null && activityTitle != null) {
                    for (Map.Entry<String, String> entry : linkedUsers.entrySet()) {
                        activityTitle = activityTitle.replace("@" + entry.getKey(), "<strong>" + entry.getValue() + "</strong>");
                    }
                }
                chat.put("title", activityTitle!=null? activityTitle.replace("&", "&amp;"):"");
                chat.put("date",DateUtil.formatDate(data.getPerformedAt(), LocaleContextHolder.getLocale().getLanguage()));
                String rawMessage = data.getActivityDetails().get("text") != null ? data.getActivityDetails().get("text").toString() : "";
                chat.put("message", updateMessage(rawMessage.replaceAll("<[^>]+>", "")));
                complaintClaimConversion.add(chat);
            });
        }
        return complaintClaimConversion;
    }

    private String updateMessage(String message) {
        // Define the regex pattern to match all tagged users in the format @[Name](ID)
        String regex = "@\\[(.*?)\\]\\(\\d+\\)";

        // Replace all matches with the captured group (Name)
        return message.replaceAll(regex, "<strong>$1</strong>");
    }

    private String encodeImageToBase64(String imagePath) throws IOException {
        ClassPathResource resource = new ClassPathResource(imagePath);
        try (InputStream inputStream = resource.getInputStream();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
            return Base64.getEncoder().encodeToString(outputStream.toByteArray());
        }
    }

    @Transactional
    public void sendAssignmentNotification(List<ClaimTicket> tickets, Long agentId) {
        User agent = userService.getUserById(agentId);
        tickets.forEach(ticket -> {
            Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(ticket, agent);
            // Send notification to the customer
            notificationService.sendNotification("TICKET_ASSIGNED_CUSTOMER_NOTIFICATION", variables.get(Constants.CUSTOMER_TICKET_URL_TEXT), List.of(ticket.getUserId()), variables);
            // Send email to the FI agent
            notificationService.sendNotification("TICKET_ASSIGNED_AGENT_NOTIFICATION",variables.get(Constants.ADMIN_TICKET_URL_TEXT), List.of(agentId), variables);
        });
    }

    @Transactional
    public void sendPriorityChangeNotification(Long ticketId) {
        ClaimTicket ticket = claimTicketRepository.findById(ticketId)
            .orElse(null);
        if(ticket!=null) {
            // Send notification to the FI agent
            if (ticket.getFiAgentId() != null && ticket.getInstanceType().equals(InstanceTypeEnum.FIRST_INSTANCE)) {
                User fiAgent = userService.getUserById(ticket.getFiAgentId());
                Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(ticket, fiAgent);
                notificationService.sendNotification("TICKET_PRIORITY_CHANGE_AGENT_NOTIFICATION", variables.get(Constants.ADMIN_TICKET_URL_TEXT), List.of(fiAgent.getId()), variables);
            } else if (ticket.getSepsAgentId() != null) { // Send email to the SEPS agent
                User sepsAgent = userService.getUserById(ticket.getSepsAgentId());
                Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(ticket, sepsAgent);
                notificationService.sendNotification("TICKET_PRIORITY_CHANGE_AGENT_NOTIFICATION", variables.get(Constants.ADMIN_TICKET_URL_TEXT), List.of(sepsAgent.getId()), variables);
            }
            if(ticket.getUserId()!=null){
                User customer = userService.getUserById(ticket.getUserId());
                Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(ticket, customer);
                notificationService.sendNotification("TICKET_PRIORITY_CHANGE_CUSTOMER_NOTIFICATION", variables.get(Constants.CUSTOMER_TICKET_URL_TEXT), List.of(ticket.getUserId()), variables);
            }
        }
    }

    @Transactional
    public void sendDateExtensionNotification(Long ticketId) {
        ClaimTicket ticket = claimTicketRepository.findById(ticketId)
            .orElse(null);
        if(ticket!=null) {
            // Send notification to the FI agent
            User receiverUser = null;
            if (ticket.getFiAgentId() != null && ticket.getInstanceType().equals(InstanceTypeEnum.FIRST_INSTANCE)) {
                receiverUser = userService.getUserById(ticket.getFiAgentId());
            } else if (ticket.getSepsAgentId() != null) { // Send email to the SEPS agent
                receiverUser = userService.getUserById(ticket.getSepsAgentId());
            }
            if(receiverUser != null) {
                Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(ticket, receiverUser);
                notificationService.sendNotification("SLA_DATE_EXTENDED_AGENT_NOTIFICATION", variables.get(Constants.ADMIN_TICKET_URL_TEXT), List.of(receiverUser.getId()), variables);
            }
        }
    }

    @Transactional
    public void sendCloseTicketNotification(Long ticketId) {
        ClaimTicket ticket = claimTicketRepository.findById(ticketId)
            .orElse(null);
        if(ticket == null) {
            return;
        }
        surveyService.generateSurveyLink(ticket.getUserId(),ticket.getId());
        if(ticket.getInstanceType().equals(InstanceTypeEnum.FIRST_INSTANCE)){
            List<User> fiAdmin = userService.getUserListByRoleSlug(ticket.getOrganizationId(), Constants.RIGHTS_FI_ADMIN);
            // Send email to FI Admin
            if (!fiAdmin.isEmpty()) {
                fiAdmin.forEach(fiAdminUser -> {
                    Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(ticket, fiAdminUser);
                    notificationService.sendNotification("TICKET_CLOSED_ADMIN_NOTIFICATION", variables.get(Constants.ADMIN_TICKET_URL_TEXT), List.of(fiAdminUser.getId()), variables);
                });
            }
            // Send email to the FI agent
            if (ticket.getFiAgentId() != null) {
                User fiAgent = userService.getUserById(ticket.getFiAgentId());
                Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(ticket, fiAgent);
                notificationService.sendNotification("TICKET_CLOSED_AGENT_NOTIFICATION", variables.get(Constants.ADMIN_TICKET_URL_TEXT), List.of(fiAgent.getId()), variables);
            }
        }else{
            List<User> sepsAdmin = userService.getUserListByRoleSlug(ticket.getOrganizationId(), Constants.RIGHTS_SEPS_ADMIN);
            // Send email to SEPS Admin
            if (!sepsAdmin.isEmpty()) {
                sepsAdmin.forEach(sepsAdminUser -> {
                    Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(ticket, sepsAdminUser);
                    notificationService.sendNotification("TICKET_CLOSED_ADMIN_NOTIFICATION", variables.get(Constants.ADMIN_TICKET_URL_TEXT), List.of(sepsAdminUser.getId()), variables);
                });
            }
            // Send email to the FI agent
            if (ticket.getSepsAgentId() != null) {
                User sepsAgent = userService.getUserById(ticket.getSepsAgentId());
                Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(ticket, sepsAgent);
                notificationService.sendNotification("TICKET_CLOSED_AGENT_NOTIFICATION", variables.get(Constants.ADMIN_TICKET_URL_TEXT), List.of(sepsAgent.getId()), variables);
            }
        }
        User customer = userService.getUserById(ticket.getUserId());
        Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(ticket, customer);
        notificationService.sendNotification("TICKET_CLOSED_CUSTOMER_NOTIFICATION", variables.get(Constants.CUSTOMER_TICKET_URL_TEXT), List.of(customer.getId()), variables);
        ClaimTicketDTO claimTicketDto = claimTicketMapper.toDTO(ticket);
        mailService.sendSurveyForm(claimTicketDto, customer);

    }

    @Transactional
    public void sendRejectTicketNotification(Long ticketId) {
        ClaimTicket ticket = claimTicketRepository.findById(ticketId)
            .orElse(null);
        if(ticket == null) {
            return;
        }
        if(ticket.getInstanceType().equals(InstanceTypeEnum.FIRST_INSTANCE)){
            List<User> fiAdmin = userService.getUserListByRoleSlug(ticket.getOrganizationId(), Constants.RIGHTS_FI_ADMIN);
            // Send email to FI Admin
            if (!fiAdmin.isEmpty()) {
                fiAdmin.forEach(fiAdminUser -> sendNotificationToAgent(ticket,fiAdminUser));
            }
            // Send email to the FI agent
            if (ticket.getFiAgentId() != null) {
                User fiAgent = userService.getUserById(ticket.getFiAgentId());
                sendNotificationToAgent(ticket,fiAgent);
            }
        }else{
            List<User> sepsAdmin = userService.getUserListByRoleSlug(ticket.getOrganizationId(), Constants.RIGHTS_SEPS_ADMIN);
            // Send email to SEPS Admin
            if (!sepsAdmin.isEmpty()) {
                sepsAdmin.forEach(sepsAdminUser -> sendNotificationToAgent(ticket,sepsAdminUser));
            }
            // Send email to the FI agent
            if (ticket.getSepsAgentId() != null) {
                User sepsAgent = userService.getUserById(ticket.getSepsAgentId());
                sendNotificationToAgent(ticket,sepsAgent);
            }
        }
        User customer = userService.getUserById(ticket.getUserId());
        Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(ticket, customer);
        notificationService.sendNotification("TICKET_REJECTED_CUSTOMER_NOTIFICATION", variables.get(Constants.CUSTOMER_TICKET_URL_TEXT), List.of(customer.getId()), variables);
    }

    private void sendNotificationToAgent(ClaimTicket ticket, User user){
        Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(ticket, user);
        notificationService.sendNotification("TICKET_REJECTED_AGENT_NOTIFICATION", variables.get(Constants.ADMIN_TICKET_URL_TEXT), List.of(user.getId()), variables);
    }

    @Transactional
    public void sendReplyToCustomerNotification(Long ticketId) {
        ClaimTicket ticket = claimTicketRepository.findById(ticketId)
            .orElse(null);
        if(ticket == null) {
            return;
        }
        User customer = userService.getUserById(ticket.getUserId());
        Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(ticket, customer);
        notificationService.sendNotification("AGENT_REPLY_CUSTOMER_NOTIFICATION", variables.get(Constants.CUSTOMER_TICKET_URL_TEXT), List.of(customer.getId()), variables);
    }

    @Transactional
    public void sendTaggedUserNotification(Long ticketId, @Valid ClaimTicketReplyRequest claimTicketReplyRequest) {
        ClaimTicket ticket = claimTicketRepository.findById(ticketId)
            .orElse(null);
        if(ticket == null) {
            return;
        }
        // getTagged User list
        List<String> taggedUsers = getTaggedUsers(claimTicketReplyRequest.getMessage());
        if(!taggedUsers.isEmpty()){
            taggedUsers.forEach(taggedUser->{
                User tagUser = userService.findUserById(Long.valueOf(taggedUser));
                if(tagUser!=null) {
                    Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(ticket, tagUser);
                    notificationService.sendNotification("TAGGED_USER_NOTIFICATION", variables.get(Constants.ADMIN_TICKET_URL_TEXT), List.of(tagUser.getId()), variables);
                }
            });
        }
    }

    private List<String> getTaggedUsers(String message) {
        // Define the regex pattern to match tagged users in the format @[Name](ID)
        String regex = "@\\[.*?\\]\\((\\d+)\\)";

        // Create a list to store the extracted user IDs
        List<String> taggedUserIds = new ArrayList<>();

        // Create a Pattern object
        Pattern pattern = Pattern.compile(regex);

        // Create a Matcher object
        Matcher matcher = pattern.matcher(message);

        // Extract all user IDs
        while (matcher.find()) {
            // Group 1 contains the user ID
            taggedUserIds.add(matcher.group(1));
        }

        return taggedUserIds;
    }
}
