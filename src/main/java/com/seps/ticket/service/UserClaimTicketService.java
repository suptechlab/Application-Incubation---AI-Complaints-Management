package com.seps.ticket.service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.seps.ticket.component.DateUtil;
import com.seps.ticket.component.EnumUtil;
import com.seps.ticket.config.Constants;
import com.seps.ticket.config.InstantTypeAdapter;
import com.seps.ticket.domain.*;
import com.seps.ticket.enums.*;
import com.seps.ticket.repository.*;
import com.seps.ticket.security.AuthoritiesConstants;
import com.seps.ticket.service.dto.*;
import com.seps.ticket.service.dto.workflow.ClaimTicketWorkFlowDTO;
import com.seps.ticket.service.mapper.ClaimTicketMapper;
import com.seps.ticket.service.mapper.UserClaimTicketMapper;
import com.seps.ticket.service.projection.ClaimStatusCountProjection;
import com.seps.ticket.service.specification.ClaimTicketSpecification;
import com.seps.ticket.suptech.service.DocumentService;
import com.seps.ticket.suptech.service.FileStorageException;
import com.seps.ticket.suptech.service.InvalidFileTypeException;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import com.seps.ticket.web.rest.vm.*;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;
import org.thymeleaf.context.Context;
import org.zalando.problem.Status;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import static com.seps.ticket.component.CommonHelper.convertEntityToMap;


@Service
public class UserClaimTicketService {
    private static final Logger LOG = LoggerFactory.getLogger(UserClaimTicketService.class);

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
    private final MailService mailService;
    private final ClaimTicketWorkFlowService claimTicketWorkFlowService;
    private final UserRepository userRepository;
    private final ClaimTicketAssignLogRepository claimTicketAssignLogRepository;
    private final TempDocumentService tempDocumentService;

    public UserClaimTicketService(ProvinceRepository provinceRepository, CityRepository cityRepository,
                                  OrganizationRepository organizationRepository, ClaimTypeRepository claimTypeRepository,
                                  ClaimSubTypeRepository claimSubTypeRepository, ClaimTicketRepository claimTicketRepository,
                                  UserService userService, UserClaimTicketMapper userClaimTicketMapper, AuditLogService auditLogService,
                                  Gson gson, MessageSource messageSource, ClaimTicketMapper claimTicketMapper, DocumentService documentService,
                                  ClaimTicketDocumentRepository claimTicketDocumentRepository, ClaimTicketStatusLogRepository claimTicketStatusLogRepository,
                                  ClaimTicketInstanceLogRepository claimTicketInstanceLogRepository, ClaimTicketPriorityLogRepository claimTicketPriorityLogRepository,
                                  EnumUtil enumUtil, ClaimTicketActivityLogService claimTicketActivityLogService, MailService mailService,
                                  ClaimTicketWorkFlowService claimTicketWorkFlowService, UserRepository userRepository, ClaimTicketAssignLogRepository claimTicketAssignLogRepository, TempDocumentService tempDocumentService) {
        this.provinceRepository = provinceRepository;
        this.cityRepository = cityRepository;
        this.organizationRepository = organizationRepository;
        this.claimTypeRepository = claimTypeRepository;
        this.claimSubTypeRepository = claimSubTypeRepository;
        this.claimTicketRepository = claimTicketRepository;
        this.userService = userService;
        this.userClaimTicketMapper = userClaimTicketMapper;
        this.auditLogService = auditLogService;
        this.tempDocumentService = tempDocumentService;
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
        this.mailService = mailService;
        this.claimTicketWorkFlowService = claimTicketWorkFlowService;
        this.userRepository = userRepository;
        this.claimTicketAssignLogRepository = claimTicketAssignLogRepository;
    }

    /**
     * Handles the process of filing a claim ticket.
     *
     * <p>This method performs the following operations:
     * <ul>
     *   <li>Validates if a duplicate claim ticket exists for the user based on the provided parameters.</li>
     *   <li>If no duplicate is found, it validates and fetches related entities such as Province, City, Organization, ClaimType, and ClaimSubType.</li>
     *   <li>Generates a unique ticket ID and saves a new claim ticket with the provided details.</li>
     * </ul>
     *
     * @param claimTicketRequest the request payload containing claim ticket details.
     * @param requestInfo        the request information for logging purposes.
     * @return {@link ClaimTicketResponseDTO} containing information about the filed claim,
     * including whether a duplicate was found and the new ticket ID (if created).
     * @throws CustomException if any validation fails for the provided input.
     */
    @Transactional
    public ClaimTicketResponseDTO fileClaimTicket(ClaimTicketRequest claimTicketRequest, RequestInfo requestInfo) {
        User currentUser = userService.getCurrentUser();
        Long currentUserId = currentUser.getId();
        ClaimTicketResponseDTO responseDTO = new ClaimTicketResponseDTO();
        responseDTO.setCheckDuplicate(claimTicketRequest.getCheckDuplicate());
        // Check for duplicate tickets if requested
        if (Boolean.TRUE.equals(claimTicketRequest.getCheckDuplicate())) {
            ClaimTicket duplicateTicket = findDuplicateTicket(claimTicketRequest, currentUserId);
            if (duplicateTicket != null) {
                responseDTO.setFoundDuplicate(true);
                responseDTO.setDuplicateTicketId(duplicateTicket.getTicketId());
                return responseDTO;
            }
        }
        responseDTO.setFoundDuplicate(false);

        // Fetch and validate associated entities
        Province province = findProvince(claimTicketRequest.getProvinceId());
        City city = findCity(claimTicketRequest.getCityId(), claimTicketRequest.getProvinceId());
        Organization organization = findOrganization(claimTicketRequest.getOrganizationId());
        ClaimType claimType = findClaimType(claimTicketRequest.getClaimTypeId());
        ClaimSubType claimSubType = findClaimSubType(claimTicketRequest.getClaimSubTypeId(), claimTicketRequest.getClaimTypeId());

        //Workflow Start
        List<Long> processedWorkflowIds = new ArrayList<>(); // Track processed workflow IDs
        ClaimTicketWorkFlowDTO claimTicketWorkFlowDTO;
        UserDTO userDTO = null;
        do {
            // Find the next workflow excluding already processed ones
            claimTicketWorkFlowDTO = claimTicketWorkFlowService.findCreateWorkFlow(claimTicketRequest.getOrganizationId(), InstanceTypeEnum.FIRST_INSTANCE,
                claimTicketRequest.getClaimTypeId(), claimTicketRequest.getClaimSubTypeId(), processedWorkflowIds);
            if (claimTicketWorkFlowDTO == null) {
                // No more workflows to process
                break;
            }
            // Add current workflow ID to the processed list
            processedWorkflowIds.add(claimTicketWorkFlowDTO.getId());
            // Validate the workflow
            userDTO = claimTicketWorkFlowService.validateAssignAction(claimTicketWorkFlowDTO);
            // If `UserDTO` is null, skip this workflow and continue
        } while (userDTO == null);
        //Workflow End

        // Create and save the new claim ticket
        ClaimTicket newClaimTicket = createClaimTicket(claimTicketRequest, currentUser, province, city, organization, claimType, claimSubType);
        if (claimTicketWorkFlowDTO != null && userDTO != null) {
            User fiAgent = userRepository.findById(userDTO.getId())
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_NOT_FOUND, null, null));
            newClaimTicket.setFiAgent(fiAgent);
            newClaimTicket.setAssignedAt(Instant.now());
            newClaimTicket.setStatus(ClaimTicketStatusEnum.ASSIGNED);
            if (newClaimTicket.getSlaBreachDays() != null) {
                LocalDate slaBreachDate = LocalDate.now().plusDays(newClaimTicket.getSlaBreachDays());
                newClaimTicket.setSlaBreachDate(slaBreachDate);
            }
            responseDTO.setClaimTicketWorkFlowId(claimTicketWorkFlowDTO.getId());
        }
        claimTicketRepository.save(newClaimTicket);

        // Handle attachments and save documents
        DocumentSourceEnum source = DocumentSourceEnum.FILE_A_CLAIM;
        List<ClaimTicketDocument> claimTicketDocuments = uploadFileAttachments(claimTicketRequest.getAttachments(), newClaimTicket, currentUser, source);
        // Save documents if any were uploaded

        if (!claimTicketDocuments.isEmpty()) {
            claimTicketDocumentRepository.saveAll(claimTicketDocuments);
        }
        if(claimTicketRequest.getSource() != null && claimTicketRequest.getSource().equals(SourceEnum.CHATBOT) && !claimTicketRequest.getAttachmentsIds().isEmpty()){
            List<ClaimTicketDocument> claimTicketDocumentsByIds = tempDocumentService.uploadTempToPermanentFiles(claimTicketRequest.getAttachmentsIds(), newClaimTicket, source, currentUser);
            if(!claimTicketDocumentsByIds.isEmpty()){
                claimTicketDocumentRepository.saveAll(claimTicketDocumentsByIds);
                claimTicketDocuments.addAll(claimTicketDocumentsByIds);
            }
        }

        // Log all claim ticket-related information
        logFileAClaimTicketDetails(newClaimTicket, claimTicketWorkFlowDTO, userDTO, currentUserId);

        // Populate response
        responseDTO.setNewTicketId(newClaimTicket.getTicketId());
        responseDTO.setNewId(newClaimTicket.getId());
        responseDTO.setEmail(currentUser.getEmail());

        // Log activity and audit
        newClaimTicket.setClaimTicketDocuments(claimTicketDocuments);
        logActivityAndAudit(newClaimTicket, claimTicketRequest, requestInfo, currentUser);
        return responseDTO;
    }

    private void logFileAClaimTicketDetails(ClaimTicket claimTicket, ClaimTicketWorkFlowDTO claimTicketWorkFlowDTO, UserDTO userDTO, Long currentUserId) {
        // Log claim ticket status
        ClaimTicketStatusLog claimTicketStatusLog = new ClaimTicketStatusLog();
        claimTicketStatusLog.setTicketId(claimTicket.getId());
        claimTicketStatusLog.setStatus(claimTicket.getStatus());
        claimTicketStatusLog.setCreatedBy(currentUserId);
        claimTicketStatusLog.setInstanceType(claimTicket.getInstanceType());
        if (claimTicketWorkFlowDTO != null && userDTO != null) {
            claimTicketStatusLog.setClaimTicketWorkFlowId(claimTicketWorkFlowDTO.getId());
            claimTicketStatusLog.setClaimTicketWorkFlowData(gson.toJson(claimTicketWorkFlowDTO));
        }
        claimTicketStatusLogRepository.save(claimTicketStatusLog);

        // Log claim ticket instance
        ClaimTicketInstanceLog claimTicketInstanceLog = new ClaimTicketInstanceLog();
        claimTicketInstanceLog.setTicketId(claimTicket.getId());
        claimTicketInstanceLog.setInstanceType(claimTicket.getInstanceType());
        claimTicketInstanceLog.setCreatedBy(currentUserId);
        if (claimTicketWorkFlowDTO != null && userDTO != null) {
            claimTicketInstanceLog.setClaimTicketWorkFlowId(claimTicketWorkFlowDTO.getId());
            claimTicketInstanceLog.setClaimTicketWorkFlowData(gson.toJson(claimTicketWorkFlowDTO));
        }
        claimTicketInstanceLogRepository.save(claimTicketInstanceLog);

        // Log claim ticket priority
        ClaimTicketPriorityLog claimTicketPriorityLog = new ClaimTicketPriorityLog();
        claimTicketPriorityLog.setTicketId(claimTicket.getId());
        claimTicketPriorityLog.setCreatedBy(currentUserId);
        claimTicketPriorityLog.setPriority(claimTicket.getPriority());
        claimTicketPriorityLog.setInstanceType(claimTicket.getInstanceType());
        if (claimTicketWorkFlowDTO != null && userDTO != null) {
            claimTicketPriorityLog.setClaimTicketWorkFlowId(claimTicketWorkFlowDTO.getId());
            claimTicketPriorityLog.setClaimTicketWorkFlowData(gson.toJson(claimTicketWorkFlowDTO));
        }
        claimTicketPriorityLogRepository.save(claimTicketPriorityLog);

        // Log claim ticket assignment if applicable
        if (claimTicket.getFiAgent() != null) {
            ClaimTicketAssignLog assignLog = new ClaimTicketAssignLog();
            assignLog.setTicketId(claimTicket.getId());
            assignLog.setUserId(claimTicket.getFiAgent().getId());
            assignLog.setUserType(UserTypeEnum.FI_USER);
            assignLog.setInstanceType(claimTicket.getInstanceType());
            assignLog.setClaimTicketWorkFlowId(claimTicketWorkFlowDTO.getId());
            assignLog.setClaimTicketWorkFlowData(gson.toJson(claimTicketWorkFlowDTO));
            assignLog.setCreatedBy(currentUserId);
            claimTicketAssignLogRepository.save(assignLog);
        }
    }

    /**
     * Finds a duplicate ticket based on claim ticket request and user ID.
     */
    private ClaimTicket findDuplicateTicket(ClaimTicketRequest claimTicketRequest, Long userId) {
        List<ClaimTicket> duplicateTickets = claimTicketRepository.findByUserIdAndClaimTypeIdAndClaimSubTypeIdAndOrganizationId(
            userId,
            claimTicketRequest.getClaimTypeId(),
            claimTicketRequest.getClaimSubTypeId(),
            claimTicketRequest.getOrganizationId()
        );
        return duplicateTickets.stream().findAny().orElse(null);
    }

    /**
     * Fetches the province from the repository, throwing an exception if not found.
     */
    public Province findProvince(Long provinceId) {
        return provinceRepository.findById(provinceId)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.PROVINCE_NOT_FOUND, null, null));
    }

    /**
     * Fetches the city from the repository, throwing an exception if not found.
     */
    public City findCity(Long cityId, Long provinceId) {
        return cityRepository.findByIdAndProvinceId(cityId, provinceId)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CITY_NOT_FOUND, null, null));
    }

    /**
     * Fetches the organization from the repository, throwing an exception if not found.
     */
    public Organization findOrganization(Long organizationId) {
        return organizationRepository.findById(organizationId)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.ORGANIZATION_NOT_FOUND, null, null));
    }

    /**
     * Fetches the claim type from the repository, throwing an exception if not found.
     */
    public ClaimType findClaimType(Long claimTypeId) {
        return claimTypeRepository.findById(claimTypeId)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TYPE_NOT_FOUND, null, null));
    }

    /**
     * Fetches the claim subtype from the repository, throwing an exception if not found.
     */
    public ClaimSubType findClaimSubType(Long claimSubTypeId, Long claimTypeId) {
        return claimSubTypeRepository.findByIdAndClaimTypeId(claimSubTypeId, claimTypeId)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_SUB_TYPE_NOT_FOUND, null, null));
    }

    /**
     * Creates a new claim ticket with the provided details.
     */
    private ClaimTicket createClaimTicket(ClaimTicketRequest claimTicketRequest, User currentUser, Province province,
                                          City city, Organization organization, ClaimType claimType, ClaimSubType claimSubType) {
        ClaimTicket newClaimTicket = new ClaimTicket();
        newClaimTicket.setTicketId(generateTicketId());
        newClaimTicket.setUser(currentUser);
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
        newClaimTicket.setCanCreateInstance(true);
        newClaimTicket.setSource(claimTicketRequest.getSource() != null ? claimTicketRequest.getSource() : SourceEnum.WEB);
        newClaimTicket.setChannelOfEntry(claimTicketRequest.getChannelOfEntry() !=null ? claimTicketRequest.getChannelOfEntry(): ChannelOfEntryEnum.WEB);
        return newClaimTicket;
    }

    /**
     * Logs the activity and audit messages for the filed claim ticket.
     */
    private void logActivityAndAudit(ClaimTicket newClaimTicket, ClaimTicketRequest claimTicketRequest,
                                     RequestInfo requestInfo, User currentUser) {
        Map<String, String> activityMessageMap = new HashMap<>();
        Map<String, String> auditMessageMap = new HashMap<>();
        Map<String, Object> activityData = new HashMap<>();
        Map<String, Object> auditData = new HashMap<>();
        String plainTicketId = String.valueOf(newClaimTicket.getTicketId());
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String activityMessage = messageSource.getMessage("activity.log.file.a.claim",
                new Object[]{plainTicketId}, Locale.forLanguageTag(language.getCode()));
            activityMessageMap.put(language.getCode(), activityMessage);
        });
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String auditMessage = messageSource.getMessage("audit.log.claim.ticket.created",
                new Object[]{currentUser.getEmail(), plainTicketId}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), auditMessage);
        });
        UserClaimTicketDTO userClaimTicketDTO = userClaimTicketMapper.toUserClaimTicketDTO(newClaimTicket);
        ClaimTicketDTO claimTicketDTO = claimTicketMapper.toDTO(newClaimTicket);

        activityData.put(Constants.NEW_DATA, convertEntityToMap(userClaimTicketDTO));
        auditData.put(Constants.NEW_DATA, convertEntityToMap(claimTicketDTO));
        // Convert ClaimTicketRequest to ClaimTicketRequestJson using the new method
        ClaimTicketRequestForJson claimTicketRequestJson = convertToClaimTicketRequestJson(claimTicketRequest);
        // Convert the ClaimTicketRequestJson object to JSON string using Gson
        Gson gson = new Gson();
        String requestBody = gson.toJson(claimTicketRequestJson);  // Convert ClaimTicketRequestJson to JSON
        // Activity Log
        auditLogService.logActivity(currentUser.getId(), currentUser.getId(), requestInfo, "fileClaimTicket", ActionTypeEnum.CLAIM_TICKET_ADD.name(), newClaimTicket.getId(), ClaimTicket.class.getSimpleName(),
            null, activityMessageMap, activityData, ActivityTypeEnum.ACTIVITY.name(), requestBody);
        // Audit Log
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "fileClaimTicket", ActionTypeEnum.CLAIM_TICKET_ADD.name(), newClaimTicket.getId(), ClaimTicket.class.getSimpleName(),
            null, auditMessageMap, auditData, ActivityTypeEnum.DATA_ENTRY.name(), requestBody);
    }

    /**
     * Generates a unique ticket ID based on the current Unix timestamp.
     *
     * @return a 10-digit ticket ID
     */

    public long generateTicketId() {
        // Calculate the integer part dynamically; example logic:
        int integerPart = calculateIntegerPart();
        // Generate the ticket ID using the utility class
        return TicketIdGenerator.generateUniqueTicketId(integerPart, claimTicketRepository);
    }

    private int calculateIntegerPart() {
        // Example: Get the last 2 digits of a random number (or other business logic)
        return (int) (Math.random() * 100); // Replace with your actual logic
    }

    /**
     * Retrieves a Claim Ticket by its ID.
     *
     * @param id the ID of the Claimed ticket to retrieve
     * @return the DTO representing the city
     * @throws CustomException if the Claimed ticket is not found
     */
    @Transactional(readOnly = true)
    public UserClaimTicketDTO getUserClaimTicketById(Long id) {
        User currentUser = userService.getCurrentUser();
        Long userId = currentUser.getId();
        return claimTicketRepository.findByIdAndUserId(id, userId)
            .map(userClaimTicketMapper::toUserClaimTicketDTO)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                new String[]{id.toString()}, null));
    }


    /**
     * Retrieves a Claim Ticket by its ID.
     *
     * @param id the ID of the Claimed ticket to retrieve
     * @return the DTO representing the city
     * @throws CustomException if the Claimed ticket is not found
     */
    @Transactional(readOnly = true)
    public ClaimTicketDTO getClaimTicketById(Long id) {
        return claimTicketRepository.findById(id)
            .map(claimTicketMapper::toDTO)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                new String[]{id.toString()}, null));
    }

    @Transactional(readOnly = true)
    public ClaimTicket getClaimTicketByTicketId(Long ticketId) {
        return claimTicketRepository.findByTicketId(ticketId)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                new String[]{ticketId.toString()}, null));
    }


    /**
     * Retrieves a paginated list of claim tickets, filtered by year.
     *
     * @param pageable the pagination information
     * @param year     the search term to filter claim tickets by year (optional)
     * @return a paginated list of UserClaimTicketDTOs
     */
    @Transactional(readOnly = true)
    public Page<UserClaimTicketDTO> listUserClaimTickets(Pageable pageable, Integer year) {
        User currentUser = userService.getCurrentUser();
        Long userId = currentUser.getId();
        return claimTicketRepository.findAll(ClaimTicketSpecification.byFilter(year, userId), pageable)
            .map(userClaimTicketMapper::toUserClaimTicketDTO);
    }

    /**
     * Retrieves the count of claims by their status and the total number of claims for a given year and user.
     * <p>
     * This method fetches claim counts grouped by status (e.g., NEW, ASSIGNED, IN_PROGRESS, etc.) and
     * also calculates the total number of claims for the specified user and year. The counts are returned
     * in a response DTO that contains a map of statuses and their respective counts.
     * <p>
     * If there are no claims for a specific status, the status is included in the result with a count of 0.
     *
     * @param year The year for which the claim counts should be retrieved. If {@code null}, counts for all years are considered.
     * @return A {@link ClaimStatusCountResponseDTO} containing the counts of claims grouped by status and the total claim count.
     * @throws IllegalArgumentException if the {@code userId} is {@code null} or invalid.
     */
    public ClaimStatusCountResponseDTO countClaimsByStatusAndTotal(Integer year) {
        User currentUser = userService.getCurrentUser();
        Long userId = currentUser.getId();
        ClaimStatusCountResponseDTO result = new ClaimStatusCountResponseDTO();
        // Fetch counts by status using the repository
        List<ClaimStatusCountProjection> projections = claimTicketRepository.countClaimsByStatusAndTotal(year, userId);
        // Map the results to a status-to-count map
        Map<ClaimTicketStatusEnum, Long> countsByStatus = new EnumMap<>(ClaimTicketStatusEnum.class);
        for (ClaimStatusCountProjection projection : projections) {
            countsByStatus.put(projection.getStatus(), projection.getCount());
        }
        // Ensure all statuses are present in the map
        for (ClaimTicketStatusEnum status : ClaimTicketStatusEnum.values()) {
            countsByStatus.putIfAbsent(status, 0L);
        }
        // Calculate the total count of claims
        long totalClaims = countsByStatus.values().stream().mapToLong(Long::longValue).sum();
        // Add data to the result map
        result.setCountsByStatus(countsByStatus);
        result.setTotalClaims(totalClaims);
        return result;
    }

    public List<ClaimTicketDocument> uploadFileAttachments(List<MultipartFile> attachments, ClaimTicket newClaimTicket, User currentUser, DocumentSourceEnum source) {
        LOG.debug("attachments size:{}", attachments.size());
        List<ClaimTicketDocument> claimTicketDocuments = new ArrayList<>();
        // Handle file uploads and create documents
        if (!CollectionUtils.isEmpty(attachments)) {
            for (MultipartFile file : attachments) {
                try {
                    // Generate a unique file name for storage
                    String uniqueFileName = documentService.generateUniqueFileName(file.getOriginalFilename());
                    // Get the original file name, trimmed to fit within 255 characters and replace spaces with underscores
                    String originalFileName = documentService.fitFileNameToMaxLength(file.getOriginalFilename());
                    // Upload the document and get the external document ID
                    ResponseEntity<String> response = documentService.uploadDocument(file.getBytes(), String.valueOf(newClaimTicket.getTicketId()), uniqueFileName);
                    String externalDocumentId = response.getBody();  // Assuming the response body contains the externalDocumentId
                    // Create a ClaimTicketDocument and add to the list
                    ClaimTicketDocument claimTicketDocument = new ClaimTicketDocument();
                    claimTicketDocument.setClaimTicket(newClaimTicket);
                    claimTicketDocument.setExternalDocumentId(externalDocumentId);
                    claimTicketDocument.setTitle(uniqueFileName);  // Set the appropriate title (can customize as needed)
                    claimTicketDocument.setOriginalTitle(originalFileName);
                    claimTicketDocument.setInstanceType(newClaimTicket.getInstanceType());
                    claimTicketDocument.setSource(source);
                    claimTicketDocument.setInternal(IS_INTERNAL_DOCUMENT);
                    claimTicketDocument.setUploadedByUser(currentUser);
                    // Add the document to the list
                    claimTicketDocuments.add(claimTicketDocument);
                } catch (InvalidFileTypeException e) {
                    LOG.error("InvalidFileTypeException while uploadDocument:{}", e.getMessage());
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.FILE_STORAGE_ERROR, e.getMessage());
                } catch (FileStorageException e) {
                    LOG.error("Exception while uploadDocument:{}", e.getMessage());
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.FILE_STORAGE_ERROR, e.getMessage());
                } catch (IOException e) {
                    LOG.error("IOException while uploadDocument:{}", e.getMessage());
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.FILE_STORAGE_ERROR, e.getMessage());
                } catch (Exception e) {
                    String errorMessage = messageSource.getMessage("error.file.upload.unexpected", null, LocaleContextHolder.getLocale());
                    // Catch any other unexpected exceptions
                    throw new CustomException(Status.INTERNAL_SERVER_ERROR, SepsStatusCode.FILE_STORAGE_ERROR, errorMessage);
                }
            }
        }
        return claimTicketDocuments;
    }

    private ClaimTicketRequestForJson convertToClaimTicketRequestJson(ClaimTicketRequest claimTicketRequest) {
        // Create a new ClaimTicketRequestJson object
        ClaimTicketRequestForJson claimTicketRequestJson = new ClaimTicketRequestForJson();
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
        claimTicketRequestJson.setSource(claimTicketRequest.getSource());
        claimTicketRequestJson.setChannelOfEntry(claimTicketRequest.getChannelOfEntry());
        // Convert attachments (MultipartFile to filenames)
        List<String> attachments = new ArrayList<>();
        if (claimTicketRequest.getAttachments() != null) {
            for (MultipartFile file : claimTicketRequest.getAttachments()) {
                attachments.add(file.getOriginalFilename());  // Add only file name to the list
            }
        }
        claimTicketRequestJson.setAttachments(attachments);
        claimTicketRequestJson.setAttachmentsIds(claimTicketRequest.getAttachmentsIds());
        return claimTicketRequestJson;
    }


    @Transactional
    public ResponseEntity<String> uploadDocument(@Valid UploadDocumentRequest request) {
        User currentUser = userService.getCurrentUser();
        ClaimTicket claimTicket = getClaimTicketByTicketId(Long.valueOf(request.getTicketId()));
        List<MultipartFile> attachments = new ArrayList<>();
        attachments.add(request.getMultipartFile());
        List<ClaimTicketDocument> claimTicketDocuments = uploadFileAttachments(attachments, claimTicket, currentUser, DocumentSourceEnum.CONVERSATION_ON_TICKET);
        claimTicketDocumentRepository.saveAll(claimTicketDocuments);
        // Safely handle the first document (if available) and extract its externalDocumentId
        return claimTicketDocuments.stream()
            .findFirst()  // Get the first document (Optional)
            .map(doc -> ResponseEntity.ok(doc.getExternalDocumentId()))  // Map to ResponseEntity with document ID
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NO_CONTENT).body("No document uploaded"));  // Fallback if no documents
    }

    @Transactional
    public ClaimTicketWorkFlowDTO fileSecondInstanceClaimOld(SecondInstanceRequest secondInstanceRequest, RequestInfo requestInfo) {
        // Extract claim ticket ID from the request
        Long id = secondInstanceRequest.getId();
        // Retrieve the current logged-in user
        User currentUser = userService.getCurrentUser();
        Long currentUserId = currentUser.getId();
        // Fetch the claim ticket owned by the user, or throw an exception if not found
        ClaimTicket claimTicket = claimTicketRepository.findByIdAndUserIdAndInstanceType(id, currentUserId, InstanceTypeEnum.FIRST_INSTANCE)
            .orElseThrow(() -> new CustomException(
                Status.BAD_REQUEST,
                SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                new String[]{id.toString()},
                null
            ));
        // Validate claim ticket status
        ClaimTicketStatusEnum claimTicketStatus = claimTicket.getStatus();
        String statusPlain = enumUtil.getLocalizedEnumValue(claimTicketStatus, LocaleContextHolder.getLocale());
        if (!isValidForSecondInstance(claimTicketStatus)) {
            throw new CustomException(
                Status.BAD_REQUEST,
                SepsStatusCode.SECOND_INSTANCE_INVALID_CLAIM_TICKET_STATUS,
                new String[]{statusPlain},
                null
            );
        }

        ClaimTicket oldClaimTicket = claimTicketRepository.findById(id)
            .orElseThrow(() -> new CustomException(
                Status.BAD_REQUEST,
                SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                new String[]{id.toString()},
                null
            ));

        Map<String, Object> activityData = new HashMap<>();
        Map<String, Object> auditData = new HashMap<>();
        //Old Data
        activityData.put(Constants.OLD_DATA, convertEntityToMap(userClaimTicketMapper.toUserClaimTicketDTO(oldClaimTicket)));
        auditData.put(Constants.OLD_DATA, convertEntityToMap(claimTicketMapper.toDTO(oldClaimTicket)));


        claimTicket.setInstanceType(InstanceTypeEnum.SECOND_INSTANCE);
        claimTicket.setResolvedOn(null);

        //Workflow Start
        List<Long> processedWorkflowIds = new ArrayList<>(); // Track processed workflow IDs
        ClaimTicketWorkFlowDTO claimTicketWorkFlowDTO;
        UserDTO userDTO = null;
        do {
            // Find the next workflow excluding already processed ones
            claimTicketWorkFlowDTO = claimTicketWorkFlowService.findCreateWorkFlow(claimTicket.getOrganizationId(),
                InstanceTypeEnum.SECOND_INSTANCE, claimTicket.getClaimTypeId(), claimTicket.getClaimSubTypeId(), processedWorkflowIds);
            if (claimTicketWorkFlowDTO == null) {
                // No more workflows to process
                break;
            }
            // Add current workflow ID to the processed list
            processedWorkflowIds.add(claimTicketWorkFlowDTO.getId());
            // Validate the workflow
            userDTO = claimTicketWorkFlowService.validateAssignAction(claimTicketWorkFlowDTO);
            // If `UserDTO` is null, skip this workflow and continue
        } while (userDTO == null);
        //Workflow End
        if (claimTicketWorkFlowDTO != null && userDTO != null) {
            User sepsAgent = userRepository.findById(userDTO.getId())
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_NOT_FOUND, null, null));
            claimTicket.setSepsAgent(sepsAgent);
            claimTicket.setAssignedAt(Instant.now());
            claimTicket.setStatus(ClaimTicketStatusEnum.ASSIGNED);
            if (claimTicket.getSlaBreachDays() != null) {
                LocalDate slaBreachDate = LocalDate.now().plusDays(claimTicket.getSlaBreachDays());
                claimTicket.setSlaBreachDate(slaBreachDate);
            }
        } else {
            // Business logic for filing the second instance claim
            claimTicket.setStatus(ClaimTicketStatusEnum.NEW);
            claimTicket.setSlaBreachDate(null);
        }
        claimTicket.setClosedStatus(null);
        claimTicket.setRejectedStatus(null);
        claimTicket.setSecondInstanceFiledAt(Instant.now());
        claimTicket.setSecondInstanceComment(secondInstanceRequest.getComment());
        claimTicket.setUpdatedAt(Instant.now());
        claimTicket.setUpdatedByUser(currentUser);
        if(secondInstanceRequest.getSource() != null){
            claimTicket.setSource(secondInstanceRequest.getSource());
        }
        if(secondInstanceRequest.getChannelOfEntry()!=null){
            claimTicket.setChannelOfEntry(secondInstanceRequest.getChannelOfEntry());
        }
        // Save the updated claim ticket to the database
        claimTicketRepository.save(claimTicket);

        // Handle and save file attachments related to this claim
        DocumentSourceEnum source = DocumentSourceEnum.FILE_A_SECOND_INSTANCE;
        List<ClaimTicketDocument> claimTicketDocuments = uploadFileAttachments(secondInstanceRequest.getAttachments(),
            claimTicket, currentUser, source);

        // Save the documents if any were uploaded
        if (!claimTicketDocuments.isEmpty()) {
            claimTicketDocumentRepository.saveAll(claimTicketDocuments);
        }
        if(secondInstanceRequest.getSource() != null && secondInstanceRequest.getSource().equals(SourceEnum.CHATBOT) && !secondInstanceRequest.getAttachmentsIds().isEmpty()){
            List<ClaimTicketDocument> claimTicketDocumentsByIds = tempDocumentService.uploadTempToPermanentFiles(secondInstanceRequest.getAttachmentsIds(), claimTicket, source, currentUser);
            if(!claimTicketDocumentsByIds.isEmpty()){
                claimTicketDocumentRepository.saveAll(claimTicketDocumentsByIds);
            }
        }
        //Log all claim related ticket details
        logClaimTicketDetails(claimTicket, claimTicketWorkFlowDTO, userDTO, currentUserId);

        // Set the updated list of documents back to the claim ticket
        List<ClaimTicketDocument> userClaimTicketDocumentList = claimTicketDocumentRepository.findAllByClaimTicketIdAndInternal(id, false);
        List<ClaimTicketDocument> claimTicketDocumentList = claimTicketDocumentRepository.findAllByClaimTicketId(id);
        // Convert user claim ticket documents to UserClaimTicketDTO
        List<UserClaimTicketDocumentDTO> userClaimTicketDTOList = userClaimTicketDocumentList.stream()
            .map(this::convertToUserClaimTicketDocumentDTO)
            .toList();
        // Convert claim ticket documents to ClaimTicketDTO
        List<ClaimTicketDocumentDTO> claimTicketDTOList = claimTicketDocumentList.stream()
            .map(this::convertToClaimTicketDocumentDTO)
            .toList();

        UserClaimTicketDTO userClaimTicketDTO = userClaimTicketMapper.toUserClaimTicketDTO(claimTicket);
        ClaimTicketDTO claimTicketDTO = claimTicketMapper.toDTO(claimTicket);

        userClaimTicketDTO.setClaimTicketDocuments(userClaimTicketDTOList);
        claimTicketDTO.setClaimTicketDocuments(claimTicketDTOList);

        //New Data
        activityData.put(Constants.NEW_DATA, convertEntityToMap(userClaimTicketDTO));
        auditData.put(Constants.NEW_DATA, convertEntityToMap(claimTicketDTO));

        // Perform additional logging and auditing actions
        logActivityAndAuditOfSecondInstance(claimTicket, activityData, auditData, secondInstanceRequest, requestInfo, currentUser);
        LOG.info("Second instance claim filed for claim ticket {} by user {}", id, currentUserId);
        return claimTicketWorkFlowDTO;
    }

    @Transactional
    public ClaimTicketWorkFlowDTO fileSecondInstanceClaim(SecondInstanceRequest secondInstanceRequest, RequestInfo requestInfo) {
        Long originalClaimId = secondInstanceRequest.getId();
        User currentUser = userService.getCurrentUser();
        Long currentUserId = currentUser.getId();

        claimTicketRepository.findByInstanceTypeAndPreviousTicketId(InstanceTypeEnum.SECOND_INSTANCE, originalClaimId)
            .ifPresent(ticket -> {
                throw new CustomException(
                    Status.BAD_REQUEST,
                    SepsStatusCode.SECOND_INSTANCE_CLAIM_TICKET_ALREADY_CREATED,
                    null, null
                );
            });

        // Fetch the original claim ticket owned by the user
        ClaimTicket originalClaimTicket = claimTicketRepository.findByIdAndUserIdAndInstanceType(originalClaimId, currentUserId, InstanceTypeEnum.FIRST_INSTANCE)
            .orElseThrow(() -> new CustomException(
                Status.BAD_REQUEST,
                SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                new String[]{originalClaimId.toString()},
                null
            ));

        // Validate claim ticket status
        ClaimTicketStatusEnum claimTicketStatus = originalClaimTicket.getStatus();
        String statusPlain = enumUtil.getLocalizedEnumValue(claimTicketStatus, LocaleContextHolder.getLocale());
        if (!isValidForSecondInstance(claimTicketStatus)) {
            throw new CustomException(
                Status.BAD_REQUEST,
                SepsStatusCode.SECOND_INSTANCE_INVALID_CLAIM_TICKET_STATUS,
                new String[]{statusPlain},
                null
            );
        }

        // Clone the original claim ticket
        ClaimTicket newClaimTicket = new ClaimTicket();
        newClaimTicket.setTicketId(generateTicketId());
        newClaimTicket.setUser(currentUser);
        newClaimTicket.setProvince(originalClaimTicket.getProvince());
        newClaimTicket.setCity(originalClaimTicket.getCity());
        newClaimTicket.setOrganization(originalClaimTicket.getOrganization());
        newClaimTicket.setClaimType(originalClaimTicket.getClaimType());
        newClaimTicket.setClaimSubType(originalClaimTicket.getClaimSubType());
        newClaimTicket.setPriorityCareGroup(originalClaimTicket.getPriorityCareGroup());
        newClaimTicket.setCustomerType(originalClaimTicket.getCustomerType());
        newClaimTicket.setPrecedents(originalClaimTicket.getPrecedents());
        newClaimTicket.setSpecificPetition(originalClaimTicket.getSpecificPetition());
        newClaimTicket.setPriority(originalClaimTicket.getPriority());
        newClaimTicket.setSlaBreachDays(Constants.SECOND_INSTANCE_SLA_BREACH_DAYS);
        newClaimTicket.setInstanceType(InstanceTypeEnum.SECOND_INSTANCE);
        newClaimTicket.setStatus(ClaimTicketStatusEnum.NEW);
        newClaimTicket.setCreatedByUser(currentUser);
        newClaimTicket.setSecondInstanceComment(secondInstanceRequest.getComment());
        newClaimTicket.setPreviousTicketId(originalClaimId);
        newClaimTicket.setSource(secondInstanceRequest.getSource() != null ? secondInstanceRequest.getSource() : SourceEnum.WEB);
        newClaimTicket.setChannelOfEntry(secondInstanceRequest.getChannelOfEntry() !=null ? secondInstanceRequest.getChannelOfEntry(): ChannelOfEntryEnum.WEB);
        newClaimTicket.setCanCreateInstance(true);
        // Save the new claim ticket
        claimTicketRepository.save(newClaimTicket);

        // Handle attachments for the new claim ticket
        DocumentSourceEnum source = DocumentSourceEnum.FILE_A_SECOND_INSTANCE;
        List<ClaimTicketDocument> claimTicketDocuments = uploadFileAttachments(secondInstanceRequest.getAttachments(),
            newClaimTicket, currentUser, source);

        if (!claimTicketDocuments.isEmpty()) {
            claimTicketDocumentRepository.saveAll(claimTicketDocuments);
        }
        if (secondInstanceRequest.getSource() != null && secondInstanceRequest.getSource().equals(SourceEnum.CHATBOT) && !secondInstanceRequest.getAttachmentsIds().isEmpty()) {
            List<ClaimTicketDocument> claimTicketDocumentsByIds = tempDocumentService.uploadTempToPermanentFiles(secondInstanceRequest.getAttachmentsIds(), newClaimTicket, source, currentUser);
            if (!claimTicketDocumentsByIds.isEmpty()) {
                claimTicketDocumentRepository.saveAll(claimTicketDocumentsByIds);
                claimTicketDocuments.addAll(claimTicketDocumentsByIds);
            }
        }

        // Handle workflow for the new claim ticket
        ClaimTicketWorkFlowDTO claimTicketWorkFlowDTO = null;
        List<Long> processedWorkflowIds = new ArrayList<>();
        UserDTO userDTO = null;
        do {
            claimTicketWorkFlowDTO = claimTicketWorkFlowService.findCreateWorkFlow(newClaimTicket.getOrganizationId(),
                InstanceTypeEnum.SECOND_INSTANCE, newClaimTicket.getClaimTypeId(), newClaimTicket.getClaimSubTypeId(), processedWorkflowIds);

            if (claimTicketWorkFlowDTO == null) {
                break;
            }

            processedWorkflowIds.add(claimTicketWorkFlowDTO.getId());
            userDTO = claimTicketWorkFlowService.validateAssignAction(claimTicketWorkFlowDTO);
        } while (userDTO == null);

        if (claimTicketWorkFlowDTO != null && userDTO != null) {
            User sepsAgent = userRepository.findById(userDTO.getId())
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_NOT_FOUND, null, null));
            newClaimTicket.setSepsAgent(sepsAgent);
            newClaimTicket.setAssignedAt(Instant.now());
            newClaimTicket.setStatus(ClaimTicketStatusEnum.ASSIGNED);

            if (newClaimTicket.getSlaBreachDays() != null) {
                LocalDate slaBreachDate = LocalDate.now().plusDays(newClaimTicket.getSlaBreachDays());
                newClaimTicket.setSlaBreachDate(slaBreachDate);
            }
        }

        // Save the final updated ticket after workflow processing
        claimTicketRepository.save(newClaimTicket);

        // Perform logging and auditing actions
        logClaimTicketDetails(newClaimTicket, claimTicketWorkFlowDTO, userDTO, currentUserId);

        // Log activity and audit
        newClaimTicket.setClaimTicketDocuments(claimTicketDocuments);
        originalClaimTicket.setCanCreateInstance(false);
        claimTicketRepository.save(originalClaimTicket);
        UserClaimTicketDTO userClaimTicketDTO = userClaimTicketMapper.toUserClaimTicketDTO(newClaimTicket);
        userClaimTicketDTO.setPreviousTicket(userClaimTicketMapper.toUserClaimTicketDTO(originalClaimTicket));
        ClaimTicketDTO claimTicketDTO = claimTicketMapper.toDTO(newClaimTicket);
        claimTicketDTO.setPreviousTicket(claimTicketMapper.toDTO(originalClaimTicket));

        Map<String, Object> activityData = new HashMap<>();
        Map<String, Object> auditData = new HashMap<>();
        //New Data
        activityData.put(Constants.NEW_DATA, convertEntityToMap(userClaimTicketDTO));
        auditData.put(Constants.NEW_DATA, convertEntityToMap(claimTicketDTO));


        // Perform additional logging and auditing actions
        logActivityAndAuditOfSecondInstance(newClaimTicket, activityData, auditData, secondInstanceRequest, requestInfo, currentUser);

        LOG.info("Second instance claim filed for claim ticket {} by user {}", originalClaimId, currentUserId);

        return claimTicketWorkFlowDTO;
    }

    private void logClaimTicketDetails(ClaimTicket claimTicket, ClaimTicketWorkFlowDTO claimTicketWorkFlowDTO, UserDTO userDTO,
                                       Long currentUserId) {
        /*-----------------*/
        // Log claim ticket status
        ClaimTicketStatusLog claimTicketStatusLog = new ClaimTicketStatusLog();
        claimTicketStatusLog.setTicketId(claimTicket.getId());
        claimTicketStatusLog.setStatus(claimTicket.getStatus());
        claimTicketStatusLog.setCreatedBy(currentUserId);
        claimTicketStatusLog.setInstanceType(claimTicket.getInstanceType());
        if (claimTicketWorkFlowDTO != null && userDTO != null) {
            claimTicketStatusLog.setClaimTicketWorkFlowId(claimTicketWorkFlowDTO.getId());
            claimTicketStatusLog.setClaimTicketWorkFlowData(gson.toJson(claimTicketWorkFlowDTO));
        }
        claimTicketStatusLogRepository.save(claimTicketStatusLog);

        // Log claim ticket instance
        ClaimTicketInstanceLog claimTicketInstanceLog = new ClaimTicketInstanceLog();
        claimTicketInstanceLog.setTicketId(claimTicket.getId());
        claimTicketInstanceLog.setInstanceType(claimTicket.getInstanceType());
        claimTicketInstanceLog.setCreatedBy(currentUserId);
        if (claimTicketWorkFlowDTO != null && userDTO != null) {
            claimTicketInstanceLog.setClaimTicketWorkFlowId(claimTicketWorkFlowDTO.getId());
            claimTicketInstanceLog.setClaimTicketWorkFlowData(gson.toJson(claimTicketWorkFlowDTO));
        }
        claimTicketInstanceLogRepository.save(claimTicketInstanceLog);

        // Log claim ticket priority
        ClaimTicketPriorityLog claimTicketPriorityLog = new ClaimTicketPriorityLog();
        claimTicketPriorityLog.setTicketId(claimTicket.getId());
        claimTicketPriorityLog.setCreatedBy(currentUserId);
        claimTicketPriorityLog.setPriority(claimTicket.getPriority());
        claimTicketPriorityLog.setInstanceType(claimTicket.getInstanceType());
        if (claimTicketWorkFlowDTO != null && userDTO != null) {
            claimTicketPriorityLog.setClaimTicketWorkFlowId(claimTicketWorkFlowDTO.getId());
            claimTicketPriorityLog.setClaimTicketWorkFlowData(gson.toJson(claimTicketWorkFlowDTO));
        }
        claimTicketPriorityLogRepository.save(claimTicketPriorityLog);

        // Log claim ticket assignment if applicable
        if (claimTicket.getSepsAgent() != null) {
            ClaimTicketAssignLog assignLog = new ClaimTicketAssignLog();
            assignLog.setTicketId(claimTicket.getId());
            assignLog.setUserId(claimTicket.getSepsAgent().getId());
            assignLog.setUserType(UserTypeEnum.SEPS_USER);
            assignLog.setInstanceType(claimTicket.getInstanceType());
            if (claimTicketWorkFlowDTO != null && userDTO != null) {
                assignLog.setClaimTicketWorkFlowId(claimTicketWorkFlowDTO.getId());
                assignLog.setClaimTicketWorkFlowData(gson.toJson(claimTicketWorkFlowDTO));
            }
            assignLog.setCreatedBy(currentUserId);
            claimTicketAssignLogRepository.save(assignLog);
        }
        /*------------------*/
    }

    // Helper method to validate allowed statuses
    private boolean isValidForSecondInstance(ClaimTicketStatusEnum claimTicketStatus) {
        List<ClaimTicketStatusEnum> allowedStatusList = Arrays.asList(
            ClaimTicketStatusEnum.CLOSED,
            ClaimTicketStatusEnum.REJECTED
        );
        return allowedStatusList.contains(claimTicketStatus);
    }

    // Helper method to validate allowed statuses
    private boolean isValidForComplaint(ClaimTicketStatusEnum claimTicketStatus) {
        List<ClaimTicketStatusEnum> allowedStatusList = Arrays.asList(
            ClaimTicketStatusEnum.CLOSED,
            ClaimTicketStatusEnum.REJECTED
        );
        return allowedStatusList.contains(claimTicketStatus);
    }


    /**
     * Logs the activity and audit messages for the filed second instance.
     */
    private void logActivityAndAuditOfSecondInstance(ClaimTicket claimTicket, Map<String, Object> activityData, Map<String, Object> auditData,
                                                     SecondInstanceRequest request, RequestInfo requestInfo, User currentUser) {
        Map<String, String> activityMessageMap = new HashMap<>();
        Map<String, String> auditMessageMap = new HashMap<>();
        String plainTicketId = String.valueOf(claimTicket.getTicketId());
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String activityMessage = messageSource.getMessage("activity.log.file.second.instance",
                new Object[]{plainTicketId}, Locale.forLanguageTag(language.getCode()));
            activityMessageMap.put(language.getCode(), activityMessage);
        });
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String auditMessage = messageSource.getMessage("audit.log.claim.ticket.second.instance",
                new Object[]{currentUser.getEmail(), plainTicketId}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), auditMessage);
        });
        // Convert ClaimTicketRequest to ClaimTicketRequestJson using the new method
        SecondInstanceRequestForJson secondInstanceRequestForJson = convertToSecondInstanceRequestJson(request);
        // Convert the SecondInstanceRequest object to JSON string using Gson
        Gson gson = new Gson();
        String requestBody = gson.toJson(secondInstanceRequestForJson);  // Convert SecondInstanceRequestForJson to JSON
        // Activity Log
        auditLogService.logActivity(currentUser.getId(), currentUser.getId(), requestInfo, "fileSecondInstanceClaim", ActionTypeEnum.CLAIM_TICKET_SECOND_INSTANCE.name(), claimTicket.getId(), ClaimTicket.class.getSimpleName(),
            null, activityMessageMap, activityData, ActivityTypeEnum.ACTIVITY.name(), requestBody);
        // Audit Log
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "fileSecondInstanceClaim", ActionTypeEnum.CLAIM_TICKET_SECOND_INSTANCE.name(), claimTicket.getId(), ClaimTicket.class.getSimpleName(),
            null, auditMessageMap, auditData, ActivityTypeEnum.DATA_ENTRY.name(), requestBody);
    }

    private SecondInstanceRequestForJson convertToSecondInstanceRequestJson(SecondInstanceRequest secondInstanceRequest) {
        // Create a new ClaimTicketRequestJson object
        SecondInstanceRequestForJson secondInstanceRequestForJson = new SecondInstanceRequestForJson();
        // Map properties from ClaimTicketRequest to ClaimTicketRequestJson
        secondInstanceRequestForJson.setId(secondInstanceRequest.getId());
        secondInstanceRequestForJson.setComment(secondInstanceRequest.getComment());
        // Convert attachments (MultipartFile to filenames)
        List<String> attachments = new ArrayList<>();
        if (secondInstanceRequest.getAttachments() != null) {
            for (MultipartFile file : secondInstanceRequest.getAttachments()) {
                attachments.add(file.getOriginalFilename());  // Add only file name to the list
            }
        }
        secondInstanceRequestForJson.setAttachments(attachments);
        secondInstanceRequestForJson.setSource(secondInstanceRequest.getSource());
        secondInstanceRequestForJson.setChannelOfEntry(secondInstanceRequest.getChannelOfEntry());
        secondInstanceRequestForJson.setAttachmentsIds(secondInstanceRequest.getAttachmentsIds());
        return secondInstanceRequestForJson;
    }

    // Conversion method for UserClaimTicketDocumentDTO
    private UserClaimTicketDocumentDTO convertToUserClaimTicketDocumentDTO(ClaimTicketDocument document) {
        UserClaimTicketDocumentDTO dto = new UserClaimTicketDocumentDTO();
        dto.setId(document.getId());
        dto.setClaimTicketId(document.getClaimTicketId());
        dto.setOriginalTitle(document.getOriginalTitle());
        dto.setSource(document.getSource());
        dto.setInstanceType(document.getInstanceType());
        dto.setUploadedBy(document.getUploadedBy());
        dto.setUploadedAt(document.getUploadedAt());
        // Populate the ClaimTicketDTO
        if (document.getClaimTicket() != null) {
            dto.setClaimTicket(new UserClaimTicketDocumentDTO.ClaimTicketDTO(
                document.getClaimTicket().getId(),
                document.getClaimTicket().getTicketId()
            ));
        }
        // Populate the UploadedByUser (if available)
        if (document.getUploadedByUser() != null) {
            Set<String> authorities = document.getUploadedByUser().getAuthorities() != null
                ? document.getUploadedByUser().getAuthorities().stream()
                .map(Authority::getName) // Ensure Authority has a getName() method
                .collect(Collectors.toSet())
                : null;

            dto.setUploadedByUser(new UserClaimTicketDocumentDTO.UserDTO(
                document.getUploadedByUser().getId(),
                document.getUploadedByUser().getFirstName(),
                document.getUploadedByUser().getEmail(),
                document.getUploadedByUser().getLangKey(),
                document.getUploadedByUser().getStatus(),
                authorities
            ));
        }
        return dto;
    }


    private ClaimTicketDocumentDTO convertToClaimTicketDocumentDTO(ClaimTicketDocument document) {
        ClaimTicketDocumentDTO dto = new ClaimTicketDocumentDTO();
        dto.setId(document.getId());
        dto.setClaimTicketId(document.getClaimTicketId());
        dto.setExternalDocumentId(document.getExternalDocumentId());
        dto.setTitle(document.getTitle());
        dto.setOriginalTitle(document.getOriginalTitle());
        dto.setSource(document.getSource());
        dto.setInstanceType(document.getInstanceType());
        dto.setInternal(document.getInternal());
        dto.setUploadedBy(document.getUploadedBy());
        dto.setUploadedAt(document.getUploadedAt());
        // Populate the ClaimTicketDTO
        if (document.getClaimTicket() != null) {
            dto.setClaimTicket(new ClaimTicketDocumentDTO.ClaimTicketDTO(
                document.getClaimTicket().getId(),
                document.getClaimTicket().getTicketId()
            ));
        }
        // Populate the UploadedByUser
        if (document.getUploadedByUser() != null) {
            UserDTO userDTO = new UserDTO();
            userDTO.setId(document.getUploadedByUser().getId());
            userDTO.setLogin(document.getUploadedByUser().getLogin());
            userDTO.setName(document.getUploadedByUser().getFirstName());
            userDTO.setEmail(document.getUploadedByUser().getEmail());
            userDTO.setImageUrl(document.getUploadedByUser().getImageUrl());
            userDTO.setActivated(document.getUploadedByUser().isActivated());
            userDTO.setLangKey(document.getUploadedByUser().getLangKey());
            userDTO.setCountryCode(document.getUploadedByUser().getCountryCode());
            userDTO.setPhoneNumber(document.getUploadedByUser().getPhoneNumber());
            userDTO.setStatus(document.getUploadedByUser().getStatus());
            userDTO.setIdentificacion(document.getUploadedByUser().getIdentificacion());
            userDTO.setGender(document.getUploadedByUser().getGender());
            userDTO.setFingerprintVerified(document.getUploadedByUser().isFingerprintVerified());
            userDTO.setFingerprintVerifiedAt(document.getUploadedByUser().getFingerprintVerifiedAt());
            // Convert authorities to a set of names
            if (document.getUploadedByUser().getAuthorities() != null) {
                userDTO.setAuthorities(
                    document.getUploadedByUser().getAuthorities().stream()
                        .map(Authority::getName) // Ensure Authority has a getName() method
                        .collect(Collectors.toSet())
                );
            }
            dto.setUploadedByUser(userDTO);
        }
        return dto;
    }

    /**
     * Handles the reply action on a claim ticket by the customer.
     *
     * @param ticketId                the ID of the claim ticket being replied to
     * @param claimTicketReplyRequest the reply request containing the reply message and optional attachments
     * @throws CustomException if the ticket is not found, the user is not authorized,
     *                         or the ticket is already closed or rejected
     */
    @Transactional
    public void replyOnTicket(Long ticketId, @Valid ClaimTicketReplyRequest claimTicketReplyRequest) {
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();

        // Find the ticket by ID
        ClaimTicket ticket;
        if (authority.contains(AuthoritiesConstants.USER)) {
            ticket = claimTicketRepository.findByIdAndUserId(ticketId, currentUser.getId())
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{ticketId.toString()}, null));
        } else {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.YOU_NOT_AUTHORIZED_TO_PERFORM, null, null);
        }

        if (ticket.getStatus().equals(ClaimTicketStatusEnum.CLOSED) || ticket.getStatus().equals(ClaimTicketStatusEnum.REJECTED)) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_ALREADY_CLOSED_OR_REJECTED_YOU_CANNOT_REPLY, null, null);
        }
        replyLogActivity(claimTicketReplyRequest, ticket, currentUser, ClaimTicketActivityEnum.CUSTOMER_REPLY.name());

    }

    /**
     * Logs an activity related to a reply action on a claim ticket.
     *
     * @param claimTicketReplyRequest the reply request containing the reply message and optional attachments
     * @param ticket                  the claim ticket being replied to
     * @param currentUser             the user performing the reply action
     * @param activityType            the type of activity being logged (e.g., "CUSTOMER_REPLY")
     */
    private void replyLogActivity(ClaimTicketReplyRequest claimTicketReplyRequest, ClaimTicket ticket, User currentUser, String activityType) {
        DocumentSourceEnum source = DocumentSourceEnum.CONVERSATION_ON_TICKET;
        // Handle attachments and save documents
        List<ClaimTicketDocument> claimTicketDocuments = uploadFileAttachments(claimTicketReplyRequest.getAttachments(), ticket, currentUser, source);
        // Save documents if any were uploaded
        Map<String, Object> attachments = new HashMap<>();
        if (!claimTicketDocuments.isEmpty()) {
            List<ClaimTicketDocument> savedDocuments = claimTicketDocumentRepository.saveAll(claimTicketDocuments);
            Set<ClaimTicketDocumentDTO> attachDocument = claimTicketMapper.toClaimTicketDocumentDTOs(savedDocuments);
            attachments.put("attachments", attachDocument);
        }

        ClaimTicketActivityLog activityLog = new ClaimTicketActivityLog();
        activityLog.setTicketId(ticket.getId());
        activityLog.setPerformedBy(currentUser.getId());
        Map<String, String> activityTitle = new HashMap<>();
        Map<String, String> linkedUser = new HashMap<>();
        Map<String, Object> activityDetail = new HashMap<>();
        activityLog.setActivityType(activityType);
        if (!claimTicketDocuments.isEmpty()) {
            Arrays.stream(LanguageEnum.values()).forEach(language -> {
                String messageAudit = messageSource.getMessage("ticket.activity.log.customer.replied.with.attachment",
                    new Object[]{"@" + currentUser.getId()}, Locale.forLanguageTag(language.getCode()));
                activityTitle.put(language.getCode(), messageAudit);
            });
        } else {
            Arrays.stream(LanguageEnum.values()).forEach(language -> {
                String messageAudit = messageSource.getMessage("ticket.activity.log.customer.replied",
                    new Object[]{"@" + currentUser.getId()}, Locale.forLanguageTag(language.getCode()));
                activityTitle.put(language.getCode(), messageAudit);
            });
        }
        activityDetail.put(Constants.PERFORM_BY, convertEntityToMap(claimTicketMapper.toUserDTO(currentUser)));
        activityDetail.put(Constants.TICKET_ID, ticket.getTicketId().toString());
        activityDetail.put("text", claimTicketReplyRequest.getMessage());
        linkedUser.put(currentUser.getId().toString(), currentUser.getFirstName());
        linkedUser.put(ticket.getUserId().toString(), ticket.getUser().getFirstName());

        activityLog.setActivityTitle(activityTitle);
        activityLog.setLinkedUsers(linkedUser);
        activityLog.setActivityDetails(activityDetail);
        activityLog.setAttachmentUrl(attachments);
        claimTicketActivityLogService.saveActivityLog(activityLog);
    }

    @Transactional
    public void sendCustomerReplyEmail(Long ticketId, ClaimTicketReplyRequest claimTicketRejectRequest) {
        // Fetch related users
        ClaimTicket ticket = claimTicketRepository.findById(ticketId).orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
            new String[]{ticketId.toString()}, null));

        List<User> fiAdmin = userService.getUserListByRoleSlug(ticket.getOrganizationId(), Constants.RIGHTS_FI_ADMIN);
        User fiAgent = ticket.getFiAgent();

        Map<String, String> ticketDetail = new HashMap<>();
        ticketDetail.put("ticketNumber", ticket.getTicketId().toString());
        ticketDetail.put("customerName", ticket.getUser().getFirstName());

        // Send email to FI Admin
        if (!fiAdmin.isEmpty()) {
            fiAdmin.forEach(fiAdminUser -> mailService.sendCustomerReplyEmail(ticketDetail, claimTicketRejectRequest, fiAdminUser));
        }

        if (ticket.getInstanceType().equals(InstanceTypeEnum.FIRST_INSTANCE) && fiAgent != null) {
            mailService.sendCustomerReplyEmail(ticketDetail, claimTicketRejectRequest, fiAgent);
        }

        if (ticket.getInstanceType().equals(InstanceTypeEnum.SECOND_INSTANCE) && ticket.getSepsAgent() != null) {
            mailService.sendCustomerReplyEmail(ticketDetail, claimTicketRejectRequest, ticket.getSepsAgent());
        }
    }

    @Transactional
    public ClaimTicketWorkFlowDTO fileComplaintOld(ComplaintRequest complaintRequest, RequestInfo requestInfo) {
        // Extract claim ticket ID from the request
        Long id = complaintRequest.getId();
        // Retrieve the current logged-in user
        User currentUser = userService.getCurrentUser();
        Long currentUserId = currentUser.getId();
        // Fetch the claim ticket owned by the user, or throw an exception if not found
        ClaimTicket claimTicket = claimTicketRepository.findByIdAndUserIdAndInstanceType(id, currentUserId, InstanceTypeEnum.SECOND_INSTANCE)
            .orElseThrow(() -> new CustomException(
                Status.BAD_REQUEST,
                SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                new String[]{id.toString()},
                null
            ));
        // Validate claim ticket status
        ClaimTicketStatusEnum claimTicketStatus = claimTicket.getStatus();
        String statusPlain = enumUtil.getLocalizedEnumValue(claimTicketStatus, LocaleContextHolder.getLocale());
        if (!isValidForComplaint(claimTicketStatus)) {
            throw new CustomException(
                Status.BAD_REQUEST,
                SepsStatusCode.COMPLAINT_INVALID_CLAIM_TICKET_STATUS,
                new String[]{statusPlain},
                null
            );
        }

        ClaimTicket oldClaimTicket = claimTicketRepository.findById(id)
            .orElseThrow(() -> new CustomException(
                Status.BAD_REQUEST,
                SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                new String[]{id.toString()},
                null
            ));

        Map<String, Object> activityData = new HashMap<>();
        Map<String, Object> auditData = new HashMap<>();
        //Old Data
        activityData.put(Constants.OLD_DATA, convertEntityToMap(userClaimTicketMapper.toUserClaimTicketDTO(oldClaimTicket)));
        auditData.put(Constants.OLD_DATA, convertEntityToMap(claimTicketMapper.toDTO(oldClaimTicket)));
        // Business logic for filing the second instance claim
        claimTicket.setInstanceType(InstanceTypeEnum.COMPLAINT);
        claimTicket.setResolvedOn(null);
        claimTicket.setClosedStatus(null);
        claimTicket.setRejectedStatus(null);
        //Workflow Start
        List<Long> processedWorkflowIds = new ArrayList<>(); // Track processed workflow IDs
        ClaimTicketWorkFlowDTO claimTicketWorkFlowDTO;
        UserDTO userDTO = null;
        do {
            // Find the next workflow excluding already processed ones
            claimTicketWorkFlowDTO = claimTicketWorkFlowService.findCreateWorkFlow(claimTicket.getOrganizationId(),
                InstanceTypeEnum.COMPLAINT, claimTicket.getClaimTypeId(), claimTicket.getClaimSubTypeId(), processedWorkflowIds);
            if (claimTicketWorkFlowDTO == null) {
                // No more workflows to process
                break;
            }
            // Add current workflow ID to the processed list
            processedWorkflowIds.add(claimTicketWorkFlowDTO.getId());
            // Validate the workflow
            userDTO = claimTicketWorkFlowService.validateAssignAction(claimTicketWorkFlowDTO);
            // If `UserDTO` is null, skip this workflow and continue
        } while (userDTO == null);
        //Workflow End
        if (claimTicketWorkFlowDTO != null && userDTO != null) {
            User sepsAgent = userRepository.findById(userDTO.getId())
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_NOT_FOUND, null, null));

            claimTicket.setSepsAgent(sepsAgent);
            claimTicket.setAssignedAt(Instant.now());
            claimTicket.setStatus(ClaimTicketStatusEnum.ASSIGNED);
            if (claimTicket.getSlaBreachDays() != null) {
                LocalDate slaBreachDate = LocalDate.now().plusDays(claimTicket.getSlaBreachDays());
                claimTicket.setSlaBreachDate(slaBreachDate);
            }
        } else {
            // Business logic for filing the Complaint
            claimTicket.setStatus(ClaimTicketStatusEnum.NEW);
            claimTicket.setSlaBreachDate(null);
        }

        claimTicket.setComplaintPrecedents(complaintRequest.getPrecedents());
        claimTicket.setComplaintSpecificPetition(complaintRequest.getSpecificPetition());
        claimTicket.setComplaintFiledAt(Instant.now());
        claimTicket.setUpdatedAt(Instant.now());
        claimTicket.setUpdatedByUser(currentUser);
        if(complaintRequest.getSource() != null){
            claimTicket.setSource(complaintRequest.getSource());
        }
        if(complaintRequest.getChannelOfEntry()!=null){
            claimTicket.setChannelOfEntry(complaintRequest.getChannelOfEntry());
        }
        // Save the updated claim ticket to the database
        claimTicketRepository.save(claimTicket);
        // Handle and save file attachments related to this claim
        DocumentSourceEnum source = DocumentSourceEnum.RAISED_COMPLAINT;
        List<ClaimTicketDocument> claimTicketDocuments = uploadFileAttachments(complaintRequest.getAttachments(),
            claimTicket, currentUser, source);
        // Save the documents if any were uploaded
        if (!claimTicketDocuments.isEmpty()) {
            claimTicketDocumentRepository.saveAll(claimTicketDocuments);
        }
        if(complaintRequest.getSource() != null && complaintRequest.getSource().equals(SourceEnum.CHATBOT) && !complaintRequest.getAttachmentsIds().isEmpty()){
            List<ClaimTicketDocument> claimTicketDocumentsByIds = tempDocumentService.uploadTempToPermanentFiles(complaintRequest.getAttachmentsIds(), claimTicket, source, currentUser);
            if(!claimTicketDocumentsByIds.isEmpty()){
                claimTicketDocumentRepository.saveAll(claimTicketDocumentsByIds);
            }
        }
        //Log all claim related ticket details
        logClaimTicketDetails(claimTicket, claimTicketWorkFlowDTO, userDTO, currentUserId);

        // Set the updated list of documents back to the claim ticket
        List<ClaimTicketDocument> userClaimTicketDocumentList = claimTicketDocumentRepository.findAllByClaimTicketIdAndInternal(id, false);
        List<ClaimTicketDocument> claimTicketDocumentList = claimTicketDocumentRepository.findAllByClaimTicketId(id);
        // Convert user claim ticket documents to UserClaimTicketDTO
        List<UserClaimTicketDocumentDTO> userClaimTicketDTOList = userClaimTicketDocumentList.stream()
            .map(this::convertToUserClaimTicketDocumentDTO)
            .toList();
        // Convert claim ticket documents to ClaimTicketDTO
        List<ClaimTicketDocumentDTO> claimTicketDTOList = claimTicketDocumentList.stream()
            .map(this::convertToClaimTicketDocumentDTO)
            .toList();

        UserClaimTicketDTO userClaimTicketDTO = userClaimTicketMapper.toUserClaimTicketDTO(claimTicket);
        ClaimTicketDTO claimTicketDTO = claimTicketMapper.toDTO(claimTicket);
        userClaimTicketDTO.setClaimTicketDocuments(userClaimTicketDTOList);
        claimTicketDTO.setClaimTicketDocuments(claimTicketDTOList);
        //New Data
        activityData.put(Constants.NEW_DATA, convertEntityToMap(userClaimTicketDTO));
        auditData.put(Constants.NEW_DATA, convertEntityToMap(claimTicketDTO));
        // Perform additional logging and auditing actions
        logActivityAndAuditOfComplaint(claimTicket, activityData, auditData, complaintRequest, requestInfo, currentUser);
        LOG.info("Complaint filed for claim ticket {} by user {}", id, currentUserId);

        return claimTicketWorkFlowDTO;
    }

    @Transactional
    public ClaimTicketWorkFlowDTO fileComplaint(ComplaintRequest complaintRequest, RequestInfo requestInfo) {
        Long originalClaimId = complaintRequest.getId();
        User currentUser = userService.getCurrentUser();
        Long currentUserId = currentUser.getId();

        claimTicketRepository.findByInstanceTypeAndPreviousTicketId(InstanceTypeEnum.COMPLAINT, originalClaimId)
            .ifPresent(ticket -> {
                throw new CustomException(
                    Status.BAD_REQUEST,
                    SepsStatusCode.SECOND_INSTANCE_CLAIM_TICKET_ALREADY_CREATED,
                    null, null
                );
            });

        // Validate the existence of the claim ticket for the current user
        ClaimTicket originalClaimTicket = claimTicketRepository.findByIdAndUserIdAndInstanceType(originalClaimId, currentUserId, InstanceTypeEnum.SECOND_INSTANCE)
            .orElseThrow(() -> new CustomException(
                Status.BAD_REQUEST,
                SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                new String[]{originalClaimId.toString()},
                null
            ));

        // Validate claim ticket status for complaints
        ClaimTicketStatusEnum claimTicketStatus = originalClaimTicket.getStatus();
        String statusPlain = enumUtil.getLocalizedEnumValue(claimTicketStatus, LocaleContextHolder.getLocale());
        if (!isValidForComplaint(claimTicketStatus)) {
            throw new CustomException(
                Status.BAD_REQUEST,
                SepsStatusCode.COMPLAINT_INVALID_CLAIM_TICKET_STATUS,
                new String[]{statusPlain},
                null
            );
        }

        // Clone the original claim ticket for the complaint
        ClaimTicket complaintTicket = new ClaimTicket();
        complaintTicket.setTicketId(generateTicketId());
        complaintTicket.setUser(currentUser);
        complaintTicket.setProvince(originalClaimTicket.getProvince());
        complaintTicket.setCity(originalClaimTicket.getCity());
        complaintTicket.setOrganization(originalClaimTicket.getOrganization());
        complaintTicket.setClaimType(originalClaimTicket.getClaimType());
        complaintTicket.setClaimSubType(originalClaimTicket.getClaimSubType());
        complaintTicket.setPriorityCareGroup(originalClaimTicket.getPriorityCareGroup());
        complaintTicket.setCustomerType(originalClaimTicket.getCustomerType());
        complaintTicket.setPrecedents(complaintRequest.getPrecedents());
        complaintTicket.setSpecificPetition(complaintRequest.getSpecificPetition());
        complaintTicket.setPriority(originalClaimTicket.getPriority());
        complaintTicket.setSlaBreachDays(Constants.COMPLAINT_SLA_BREACH_DAYS);
        complaintTicket.setInstanceType(InstanceTypeEnum.COMPLAINT);
        complaintTicket.setStatus(ClaimTicketStatusEnum.NEW);
        complaintTicket.setCreatedByUser(currentUser);
        complaintTicket.setPreviousTicketId(originalClaimId);
        complaintTicket.setSource(complaintRequest.getSource() != null ? complaintRequest.getSource() : SourceEnum.WEB);
        complaintTicket.setChannelOfEntry(complaintRequest.getChannelOfEntry() != null ? complaintRequest.getChannelOfEntry() : ChannelOfEntryEnum.WEB);
        complaintTicket.setCanCreateInstance(false);

        // Save the complaint ticket
        claimTicketRepository.save(complaintTicket);

        // Workflow handling
        List<Long> processedWorkflowIds = new ArrayList<>();
        ClaimTicketWorkFlowDTO claimTicketWorkFlowDTO = null;
        UserDTO userDTO = null;

        do {
            claimTicketWorkFlowDTO = claimTicketWorkFlowService.findCreateWorkFlow(
                complaintTicket.getOrganizationId(),
                InstanceTypeEnum.COMPLAINT,
                complaintTicket.getClaimTypeId(),
                complaintTicket.getClaimSubTypeId(),
                processedWorkflowIds
            );

            if (claimTicketWorkFlowDTO == null) {
                break;
            }

            processedWorkflowIds.add(claimTicketWorkFlowDTO.getId());
            userDTO = claimTicketWorkFlowService.validateAssignAction(claimTicketWorkFlowDTO);
        } while (userDTO == null);

        if (claimTicketWorkFlowDTO != null && userDTO != null) {
            User sepsAgent = userRepository.findById(userDTO.getId())
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.USER_NOT_FOUND, null, null));
            complaintTicket.setSepsAgent(sepsAgent);
            complaintTicket.setAssignedAt(Instant.now());
            complaintTicket.setStatus(ClaimTicketStatusEnum.ASSIGNED);

            if (complaintTicket.getSlaBreachDays() != null) {
                LocalDate slaBreachDate = LocalDate.now().plusDays(complaintTicket.getSlaBreachDays());
                complaintTicket.setSlaBreachDate(slaBreachDate);
            }
        }

        // Save the final updated ticket
        claimTicketRepository.save(complaintTicket);

        // Handle and save file attachments related to this claim
        DocumentSourceEnum source = DocumentSourceEnum.RAISED_COMPLAINT;
        List<ClaimTicketDocument> claimTicketDocuments = uploadFileAttachments(complaintRequest.getAttachments(),
            complaintTicket, currentUser, source);
        // Save the documents if any were uploaded
        if (!claimTicketDocuments.isEmpty()) {
            claimTicketDocumentRepository.saveAll(claimTicketDocuments);
        }
        if(complaintRequest.getSource() != null && complaintRequest.getSource().equals(SourceEnum.CHATBOT) && !complaintRequest.getAttachmentsIds().isEmpty()){
            List<ClaimTicketDocument> claimTicketDocumentsByIds = tempDocumentService.uploadTempToPermanentFiles(complaintRequest.getAttachmentsIds(), complaintTicket, source, currentUser);
            if(!claimTicketDocumentsByIds.isEmpty()){
                claimTicketDocumentRepository.saveAll(claimTicketDocumentsByIds);
                claimTicketDocuments.addAll(claimTicketDocumentsByIds);
            }
        }
        //Log all claim related ticket details
        logClaimTicketDetails(complaintTicket, claimTicketWorkFlowDTO, userDTO, currentUserId);

        // Log activity and audit
        complaintTicket.setClaimTicketDocuments(claimTicketDocuments);
        originalClaimTicket.setCanCreateInstance(false);
        claimTicketRepository.save(originalClaimTicket);
        UserClaimTicketDTO userClaimTicketDTO = userClaimTicketMapper.toUserClaimTicketDTO(complaintTicket);
        userClaimTicketDTO.setPreviousTicket(userClaimTicketMapper.toUserClaimTicketDTO(originalClaimTicket));
        ClaimTicketDTO claimTicketDTO = claimTicketMapper.toDTO(complaintTicket);
        claimTicketDTO.setPreviousTicket(claimTicketMapper.toDTO(originalClaimTicket));

        Map<String, Object> activityData = new HashMap<>();
        Map<String, Object> auditData = new HashMap<>();
        //New Data
        activityData.put(Constants.NEW_DATA, convertEntityToMap(userClaimTicketDTO));
        auditData.put(Constants.NEW_DATA, convertEntityToMap(claimTicketDTO));
        // Perform additional logging and auditing actions
        logActivityAndAuditOfComplaint(complaintTicket, activityData, auditData, complaintRequest, requestInfo, currentUser);

        LOG.info("Complaint with chatbot attachment filed for claim ticket {} by user {}", originalClaimId, currentUserId);

        return claimTicketWorkFlowDTO;
    }


    private void logActivityAndAuditOfComplaint(ClaimTicket claimTicket, Map<String, Object> activityData, Map<String, Object> auditData,
                                                ComplaintRequest request, RequestInfo requestInfo, User currentUser) {
        Map<String, String> activityMessageMap = new HashMap<>();
        Map<String, String> auditMessageMap = new HashMap<>();
        String plainTicketId = String.valueOf(claimTicket.getTicketId());
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String activityMessage = messageSource.getMessage("activity.log.raised.complaint",
                new Object[]{plainTicketId}, Locale.forLanguageTag(language.getCode()));
            activityMessageMap.put(language.getCode(), activityMessage);
        });
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String auditMessage = messageSource.getMessage("audit.log.claim.ticket.file.complaint",
                new Object[]{currentUser.getEmail(), plainTicketId}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), auditMessage);
        });
        // Convert ClaimTicketRequest to ClaimTicketRequestJson using the new method
        ComplaintRequestForJson complaintRequestForJson = convertToComplaintRequestJson(request);
        // Convert the SecondInstanceRequest object to JSON string using Gson
        Gson gson = new Gson();
        String requestBody = gson.toJson(complaintRequestForJson);  // Convert SecondInstanceRequestForJson to JSON
        // Activity Log
        auditLogService.logActivity(currentUser.getId(), currentUser.getId(), requestInfo, "fileComplaint", ActionTypeEnum.CLAIM_TICKET_COMPLAINT.name(), claimTicket.getId(), ClaimTicket.class.getSimpleName(),
            null, activityMessageMap, activityData, ActivityTypeEnum.ACTIVITY.name(), requestBody);
        // Audit Log
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "fileComplaint", ActionTypeEnum.CLAIM_TICKET_COMPLAINT.name(), claimTicket.getId(), ClaimTicket.class.getSimpleName(),
            null, auditMessageMap, auditData, ActivityTypeEnum.DATA_ENTRY.name(), requestBody);

    }

    private ComplaintRequestForJson convertToComplaintRequestJson(ComplaintRequest request) {
        ComplaintRequestForJson complaintRequestForJson = new ComplaintRequestForJson();
        complaintRequestForJson.setId(request.getId());
        complaintRequestForJson.setPrecedents(request.getPrecedents());
        complaintRequestForJson.setSpecificPetition(request.getSpecificPetition());
        List<String> attachments = new ArrayList<>();
        if (complaintRequestForJson.getAttachments() != null) {
            for (MultipartFile file : request.getAttachments()) {
                attachments.add(file.getOriginalFilename());  // Add only file name to the list
            }
        }
        complaintRequestForJson.setAttachments(attachments);
        complaintRequestForJson.setSource(request.getSource());
        complaintRequestForJson.setChannelOfEntry(request.getChannelOfEntry());
        complaintRequestForJson.setAttachmentsIds(request.getAttachmentsIds());
        return complaintRequestForJson;
    }

    /**
     * Retrieves a Claim Ticket by its ID.
     *
     * @param id the ID of the Claimed ticket to retrieve
     * @return the DTO representing the city
     * @throws CustomException if the Claimed ticket is not found
     */
    @Transactional(readOnly = true)
    public ClaimTicketDTO findClaimTicketById(Long id) {
        return claimTicketRepository.findById(id)
            .map(claimTicketMapper::toDTO).orElse(null);
    }

    @Transactional
    public List<ClaimTicketListDTO> listUserClaimTicketsForChatbot(InstanceTypeEnum instanceType) {
        User currentUser = userService.getCurrentUser();
        List<ClaimTicketListDTO> claimTicketList = List.of();
        if (instanceType.equals(InstanceTypeEnum.SECOND_INSTANCE)) {
            claimTicketList = claimTicketRepository.findValidClaimTickets(
                    currentUser.getId(),
                    InstanceTypeEnum.FIRST_INSTANCE,
                    ClaimTicketStatusEnum.CLOSED,
                    ClaimTicketStatusEnum.REJECTED)
                .stream().map(claimTicketMapper::toListDTO).toList();
        } else if (instanceType.equals(InstanceTypeEnum.COMPLAINT)) {
            claimTicketList = claimTicketRepository.findValidClaimTickets(
                    currentUser.getId(),
                    InstanceTypeEnum.SECOND_INSTANCE,
                    ClaimTicketStatusEnum.CLOSED,
                    ClaimTicketStatusEnum.REJECTED)
                .stream().map(claimTicketMapper::toListDTO).toList();
        }
        return claimTicketList;
    }

    @Transactional
    public Context getTicketDetailContext(Long ticketId, RequestInfo requestInfo) throws IOException {
        User currentUser = userService.getCurrentUser();

        ClaimTicket ticket = claimTicketRepository.findByIdAndUserId(ticketId, currentUser.getId())
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                new String[]{ticketId.toString()}, null));

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

        ClassPathResource imageResource = new ClassPathResource("static/images/logo.png");
        String imagePath = imageResource.getFile().toURI().toString(); // Ensure absolute path
        context.setVariable("logo", imagePath);

        ClassPathResource calendarLogo = new ClassPathResource("static/images/calendar_today.png");
        String calenderPath = calendarLogo.getFile().toURI().toString(); // Ensure absolute path
        context.setVariable("calenderPath", calenderPath);

        return context;

    }

    private void setTicketDataForPDF(Map<String, Object> complaint, ClaimTicketDTO complaintClaim) {
        complaint.put("claimId", complaintClaim.getTicketId());
        complaint.put("createdDate", DateUtil.formatDate(complaintClaim.getCreatedAt(), LocaleContextHolder.getLocale().getLanguage()));
        complaint.put("resolveOnDate", DateUtil.formatDate(complaintClaim.getResolvedOn(), LocaleContextHolder.getLocale().getLanguage()));
        complaint.put("instanceType", enumUtil.getLocalizedEnumValue(complaintClaim.getInstanceType(), LocaleContextHolder.getLocale()));
        complaint.put("closedStatus", enumUtil.getLocalizedEnumValue(complaintClaim.getClosedStatus(), LocaleContextHolder.getLocale()));
        complaint.put("previousTicket", complaintClaim.getPreviousTicket() != null ? "#"+ complaintClaim.getPreviousTicket().getTicketId(): "");
        complaint.put("statusComment", complaintClaim.getStatusComment() != null ? complaintClaim.getStatusComment() : "");
        List<HashMap<String, Object>> complaintClaimConversion = getConversionActivity(complaintClaim);
        complaint.put("conversation", complaintClaimConversion);
    }

    private List<HashMap<String, Object>> getConversionActivity(ClaimTicketDTO ticket) {
        List<ClaimTicketActivityLogDTO> activity = claimTicketActivityLogService.getAllConversation(ticket.getId());
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
}
