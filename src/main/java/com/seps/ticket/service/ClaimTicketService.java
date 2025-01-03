package com.seps.ticket.service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.seps.ticket.component.DateUtil;
import com.seps.ticket.component.EnumUtil;
import com.seps.ticket.config.Constants;
import com.seps.ticket.config.InstantTypeAdapter;
import com.seps.ticket.domain.Authority;
import com.seps.ticket.domain.ClaimTicket;
import com.seps.ticket.domain.User;
import com.seps.ticket.enums.excel.header.ExcelHeaderClaimTicketEnum;
import com.seps.ticket.repository.*;
import com.seps.ticket.security.AuthoritiesConstants;
import com.seps.ticket.service.dto.ClaimTicketListDTO;
import com.seps.ticket.domain.*;
import com.seps.ticket.enums.*;
import com.seps.ticket.repository.*;
import com.seps.ticket.service.dto.ClaimTicketResponseDTO;
import com.seps.ticket.service.dto.DropdownListAgentForTagDTO;
import com.seps.ticket.service.mapper.ClaimTicketMapper;
import com.seps.ticket.service.mapper.UserClaimTicketMapper;
import com.seps.ticket.service.specification.ClaimTicketSpecification;
import com.seps.ticket.suptech.service.DocumentService;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import com.seps.ticket.web.rest.vm.ClaimTicketFilterRequest;
import com.seps.ticket.suptech.service.ExternalAPIService;
import com.seps.ticket.suptech.service.PersonNotFoundException;
import com.seps.ticket.suptech.service.dto.PersonInfoDTO;
import com.seps.ticket.web.rest.vm.CreateClaimTicketRequest;
import jakarta.servlet.http.HttpServletRequest;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.stream.Stream;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class ClaimTicketService {

    private static final Logger LOG = LoggerFactory.getLogger(ClaimTicketService.class);

    private final ProvinceRepository provinceRepository;
    private final CityRepository cityRepository;
    private final OrganizationRepository organizationRepository;
    private final ClaimTypeRepository claimTypeRepository;
    private final ClaimSubTypeRepository claimSubTypeRepository;
    private final ClaimTicketRepository claimTicketRepository;
    private final UserService userService;
    private final UserClaimTicketMapper userClaimTicketMapper;
    private final AuditLogService auditLogService;
    private final Gson gson;
    private final MessageSource messageSource;
    private final ClaimTicketMapper claimTicketMapper;
    private final DocumentService documentService;
    private final ClaimTicketDocumentRepository claimTicketDocumentRepository;
    private final ClaimTicketStatusLogRepository claimTicketStatusLogRepository;
    private final ClaimTicketInstanceLogRepository claimTicketInstanceLogRepository;
    private final ClaimTicketPriorityLogRepository claimTicketPriorityLogRepository;
    private static final boolean IS_INTERNAL_DOCUMENT = false;
    private final EnumUtil enumUtil;
    private final ClaimTicketActivityLogService claimTicketActivityLogService;
    private final ClaimTicketWorkFlowService claimTicketWorkFlowService;
    private final UserRepository userRepository;
    private final ClaimTicketAssignLogRepository claimTicketAssignLogRepository;
    private final ExternalAPIService externalAPIService;
    private final AuthorityRepository authorityRepository;
    private final PersonaRepository personaRepository;
    private final UserClaimTicketService userClaimTicketService;
    private final ClaimTicketOTPRepository claimTicketOTPRepository;

    public ClaimTicketService(ProvinceRepository provinceRepository, CityRepository cityRepository, OrganizationRepository organizationRepository, ClaimTypeRepository claimTypeRepository, ClaimSubTypeRepository claimSubTypeRepository, ClaimTicketRepository claimTicketRepository, UserService userService, UserClaimTicketMapper userClaimTicketMapper, AuditLogService auditLogService, Gson gson, MessageSource messageSource, ClaimTicketMapper claimTicketMapper, DocumentService documentService, ClaimTicketDocumentRepository claimTicketDocumentRepository, ClaimTicketStatusLogRepository claimTicketStatusLogRepository, ClaimTicketInstanceLogRepository claimTicketInstanceLogRepository, ClaimTicketPriorityLogRepository claimTicketPriorityLogRepository, EnumUtil enumUtil, ClaimTicketActivityLogService claimTicketActivityLogService, ClaimTicketWorkFlowService claimTicketWorkFlowService, UserRepository userRepository, ClaimTicketAssignLogRepository claimTicketAssignLogRepository, ExternalAPIService externalAPIService, AuthorityRepository authorityRepository, PersonaRepository personaRepository, UserClaimTicketService userClaimTicketService, ClaimTicketOTPRepository claimTicketOTPRepository) {
        this.provinceRepository = provinceRepository;
        this.cityRepository = cityRepository;
        this.organizationRepository = organizationRepository;
        this.claimTypeRepository = claimTypeRepository;
        this.claimSubTypeRepository = claimSubTypeRepository;
        this.claimTicketRepository = claimTicketRepository;
        this.userService = userService;
        this.userClaimTicketMapper = userClaimTicketMapper;
        this.auditLogService = auditLogService;
        this.externalAPIService = externalAPIService;
        this.authorityRepository = authorityRepository;
        this.personaRepository = personaRepository;
        this.userClaimTicketService = userClaimTicketService;
        this.claimTicketOTPRepository = claimTicketOTPRepository;
        this.gson = new GsonBuilder()
            .registerTypeAdapter(Instant.class, new InstantTypeAdapter())
            .create();
        this.messageSource = messageSource;
        this.claimTicketMapper = claimTicketMapper;
        this.documentService = documentService;
        this.claimTicketDocumentRepository = claimTicketDocumentRepository;
        this.claimTicketStatusLogRepository = claimTicketStatusLogRepository;
        this.claimTicketInstanceLogRepository = claimTicketInstanceLogRepository;
        this.claimTicketPriorityLogRepository = claimTicketPriorityLogRepository;
        this.enumUtil = enumUtil;
        this.claimTicketActivityLogService = claimTicketActivityLogService;
        this.claimTicketWorkFlowService = claimTicketWorkFlowService;
        this.userRepository = userRepository;
        this.claimTicketAssignLogRepository = claimTicketAssignLogRepository;
    }


    @Transactional
    public ClaimTicketResponseDTO createClaimTicket(@Valid CreateClaimTicketRequest claimTicketRequest, HttpServletRequest request) {
        String email = claimTicketRequest.getEmail();
        ClaimTicketOTP otpEntity = claimTicketOTPRepository.findOneByEmailIgnoreCase(email)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_OTP_CODE, null, null));
        if (otpEntity.getExpiryTime().isBefore(Instant.now())) {
            LOG.error("OTP code is expired");
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_OTP_CODE, null, null);
        }
        if (!otpEntity.isUsed()) {
            LOG.error("Email not verified :{}", email);
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.EMAIL_NOT_VERIFIED, null, null);
        }
        User currentUser = userService.getCurrentUser();


        String identificacion = claimTicketRequest.getIdentificacion();
        ClaimTicketResponseDTO responseDTO = new ClaimTicketResponseDTO();
        responseDTO.setCheckDuplicate(claimTicketRequest.getCheckDuplicate());

        //Fetch USER authority
        Authority userAuthority = authorityRepository.findById(AuthoritiesConstants.USER)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.AUTHORITY_NOT_FOUND, null, null));
        //Check if a user exists with the given identificacion and USER authority
        Set<Authority> authorities = new HashSet<>();
        authorities.add(userAuthority);
        User existUser = userRepository.findOneByIdentificacionAndAuthoritiesIn(identificacion, authorities).orElse(null);
        Long existUserId = null;

        // Step 3: Validate user account if a user exists
        if (existUser != null) {
            validateClaimTicketUserAccount(existUser);
            existUserId = existUser.getId();
        }
        // Check for duplicate tickets if requested
        if (Boolean.TRUE.equals(claimTicketRequest.getCheckDuplicate()) && existUser != null) {
            ClaimTicket duplicateTicket = findDuplicateTicket(claimTicketRequest, existUserId);
            if (duplicateTicket != null) {
                responseDTO.setFoundDuplicate(true);
                responseDTO.setDuplicateTicketId(duplicateTicket.getTicketId());
                return responseDTO;
            }
        }

        // Fetch and validate associated entities
        Province province = userClaimTicketService.findProvince(claimTicketRequest.getProvinceId());
        City city = userClaimTicketService.findCity(claimTicketRequest.getCityId(), claimTicketRequest.getProvinceId());
        Organization organization = userClaimTicketService.findOrganization(claimTicketRequest.getOrganizationId());
        ClaimType claimType = userClaimTicketService.findClaimType(claimTicketRequest.getClaimTypeId());
        ClaimSubType claimSubType = userClaimTicketService.findClaimSubType(claimTicketRequest.getClaimSubTypeId(), claimTicketRequest.getClaimTypeId());

        // Create and save the new claim ticket
        ClaimTicket newClaimTicket = createClaimTicket(claimTicketRequest, existUser, province, city, organization, claimType,
            claimSubType, currentUser);
        claimTicketRepository.save(newClaimTicket);


        // Handle attachments and save documents
        DocumentSourceEnum source = DocumentSourceEnum.FILE_A_CLAIM;
        List<ClaimTicketDocument> claimTicketDocuments = userClaimTicketService.uploadFileAttachments(claimTicketRequest.getAttachments(), newClaimTicket,
            currentUser, source);
        // Save documents if any were uploaded
        if (!claimTicketDocuments.isEmpty()) {
            claimTicketDocumentRepository.saveAll(claimTicketDocuments);
        }

        // Populate response
        responseDTO.setNewTicketId(newClaimTicket.getTicketId());
        responseDTO.setNewId(newClaimTicket.getId());
        responseDTO.setEmail(currentUser.getEmail());
        responseDTO.setFoundDuplicate(false);
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
        return newClaimTicket;
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
        if (authority.contains(AuthoritiesConstants.FI)) {
            filterRequest.setOrganizationId(currentUser.getOrganization().getId());
            if (!currentUser.hasRoleSlug(Constants.RIGHTS_FI_ADMIN)) {
                fiAgentId = currentUser.getId();
            }
        } else if (authority.contains(AuthoritiesConstants.SEPS) && !currentUser.hasRoleSlug(Constants.RIGHTS_SEPS_ADMIN)) {
            sepsAgentId = currentUser.getId();
        }

        List<ClaimTicketListDTO> claimAndComplaintsList = claimTicketRepository.findAll(ClaimTicketSpecification.bySepsFiFilter(filterRequest, fiAgentId, sepsAgentId)).stream()
            .map(claimTicketMapper::toListDTO).toList();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Claim and Complaints");

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
                row.createCell(ExcelHeaderClaimTicketEnum.TICKET_ID.ordinal()).setCellValue(data.getTicketId());
                row.createCell(ExcelHeaderClaimTicketEnum.CLAIM_TYPE.ordinal()).setCellValue(data.getClaimType().getName());
                row.createCell(ExcelHeaderClaimTicketEnum.CLAIM_SUB_TYPE.ordinal()).setCellValue(data.getClaimSubType().getName());
                row.createCell(ExcelHeaderClaimTicketEnum.FI_ENTITY.ordinal()).setCellValue(data.getOrganization().getRazonSocial());
                row.createCell(ExcelHeaderClaimTicketEnum.SLA_DATE.ordinal()).setCellValue(DateUtil.formatDate(data.getSlaBreachDate(), LocaleContextHolder.getLocale().getLanguage()));
                row.createCell(ExcelHeaderClaimTicketEnum.STATUS.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getStatus(), LocaleContextHolder.getLocale()));
                row.createCell(ExcelHeaderClaimTicketEnum.CUSTOMER_NAME.ordinal()).setCellValue(data.getUser() !=null ? data.getUser().getName():"");
                row.createCell(ExcelHeaderClaimTicketEnum.FI_AGENT.ordinal()).setCellValue(data.getFiAgent() != null ? data.getFiAgent().getName():"");
                row.createCell(ExcelHeaderClaimTicketEnum.SEPS_AGENT.ordinal()).setCellValue(data.getSepsAgent() != null ? data.getSepsAgent().getName():"");
                row.createCell(ExcelHeaderClaimTicketEnum.INSTANCE_TYPE.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getInstanceType(), LocaleContextHolder.getLocale()));
                row.createCell(ExcelHeaderClaimTicketEnum.CREATED_AT.ordinal()).setCellValue(DateUtil.formatDate(data.getCreatedAt(), LocaleContextHolder.getLocale().getLanguage()));
                row.createCell(ExcelHeaderClaimTicketEnum.SECOND_INSTANCE_CREATED_AT.ordinal()).setCellValue(DateUtil.formatDate(data.getSecondInstanceFiledAt(), LocaleContextHolder.getLocale().getLanguage()));
                row.createCell(ExcelHeaderClaimTicketEnum.COMPLAINT_CREATED_AT.ordinal()).setCellValue(DateUtil.formatDate(data.getComplaintFiledAt(), LocaleContextHolder.getLocale().getLanguage()));

            }
            // Auto-size columns
            for (ExcelHeaderClaimTicketEnum header : ExcelHeaderClaimTicketEnum.values()) {
                sheet.autoSizeColumn(header.ordinal());
            }
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

}
