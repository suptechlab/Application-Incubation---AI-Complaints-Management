package com.seps.admin.service;

import com.google.gson.Gson;
import com.seps.admin.config.Constants;
import com.seps.admin.domain.ClaimTypeEntity;
import com.seps.admin.domain.User;
import com.seps.admin.enums.ActionTypeEnum;
import com.seps.admin.enums.ActivityTypeEnum;
import com.seps.admin.enums.LanguageEnum;
import com.seps.admin.repository.ClaimTypeRepository;
import com.seps.admin.service.dto.ClaimTypeDTO;
import com.seps.admin.service.dto.DropdownListDTO;
import com.seps.admin.service.dto.RequestInfo;
import com.seps.admin.service.mapper.ClaimTypeMapper;
import com.seps.admin.service.specification.ClaimTypeSpecification;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;

import static com.seps.admin.component.CommonHelper.convertEntityToMap;

/**
 * Service class for managing Claim Types.
 */
@Service
@Transactional
public class ClaimTypeService {

    private final ClaimTypeRepository claimTypeRepository;
    private final ClaimTypeMapper claimTypeMapper;
    private final AuditLogService auditLogService;
    private final UserService userService;
    private final MessageSource messageSource;
    private final Gson gson;

    /**
     * Constructor to inject required dependencies.
     *
     * @param claimTypeRepository the repository for ClaimTypeEntity
     * @param claimTypeMapper the mapper for converting between ClaimTypeEntity and ClaimTypeDTO
     * @param auditLogService the service for logging audit activities
     * @param userService the service for retrieving user information
     * @param messageSource the source for retrieving localized messages
     * @param gson the Gson instance for JSON processing
     */
    public ClaimTypeService(ClaimTypeRepository claimTypeRepository, ClaimTypeMapper claimTypeMapper, AuditLogService auditLogService, UserService userService, MessageSource messageSource,
                            Gson gson) {
        this.claimTypeRepository = claimTypeRepository;
        this.claimTypeMapper = claimTypeMapper;
        this.auditLogService = auditLogService;
        this.userService = userService;
        this.messageSource = messageSource;
        this.gson = gson;
    }

    /**
     * Adds a new Claim Type.
     *
     * @param claimTypeDTO the DTO containing the details of the claim type
     * @param requestInfo the request information for logging
     * @return the ID of the newly created claim type
     * @throws CustomException if a claim type with the same name already exists
     */
    public Long addClaimType(ClaimTypeDTO claimTypeDTO, RequestInfo requestInfo) {
        claimTypeRepository.findByNameIgnoreCase(claimTypeDTO.getName())
            .ifPresent(existingClaimType -> {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.DUPLICATE_CLAIM_TYPE,
                    new String[]{claimTypeDTO.getName()}, null);
            });
        ClaimTypeEntity entity = claimTypeMapper.toEntity(claimTypeDTO);
        entity.setStatus(true);  // Default to active
        User currenUser = userService.getCurrentUser();
        ClaimTypeEntity claimType = claimTypeRepository.save(entity);

        Map<String, String> auditMessageMap = new HashMap<>();
        Map<String, Object> entityData = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.claim.type.created",
                new Object[]{currenUser.getEmail(), claimType.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        entityData.put(Constants.NEW_DATA,convertEntityToMap(this.getClaimTypeById(claimType.getId())));
        String requestBody = gson.toJson(claimTypeDTO);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "addClaimType", ActionTypeEnum.CLAIM_TYPE_MASTER_ADD.name(), claimType.getId(), ClaimTypeEntity.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.DATA_ENTRY.name(), requestBody);

        return claimType.getId();
    }

    /**
     * Updates an existing Claim Type.
     *
     * @param id the ID of the claim type to update
     * @param claimTypeDTO the DTO containing updated information
     * @param requestInfo the request information for logging
     * @throws CustomException if the claim type is not found or a duplicate name is detected
     */
    public void updateClaimType(Long id, ClaimTypeDTO claimTypeDTO, RequestInfo requestInfo) {
        ClaimTypeEntity entity = claimTypeRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TYPE_NOT_FOUND,
                new String[]{id.toString()}, null));

        claimTypeRepository.findByNameIgnoreCase(claimTypeDTO.getName())
            .ifPresent(duplicateClaimType -> {
                if (!duplicateClaimType.getId().equals(entity.getId())) {
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.DUPLICATE_CLAIM_TYPE,
                        new String[]{claimTypeDTO.getName()}, null);
                }
            });
        Map<String, Object> oldData = convertEntityToMap(this.getClaimTypeById(entity.getId()));
        entity.setName(claimTypeDTO.getName());
        entity.setDescription(claimTypeDTO.getDescription());
        ClaimTypeEntity claimType = claimTypeRepository.save(entity);
        User currenUser = userService.getCurrentUser();

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.claim.type.updated",
                new Object[]{currenUser.getEmail(), claimType.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getClaimTypeById(claimType.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        String requestBody = gson.toJson(claimTypeDTO);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "updateClaimType", ActionTypeEnum.CLAIM_TYPE_MASTER_EDIT.name(), claimType.getId(), ClaimTypeEntity.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);
    }

    /**
     * Retrieves a Claim Type by its ID.
     *
     * @param id the ID of the claim type
     * @return the DTO representing the claim type
     * @throws CustomException if the claim type is not found
     */
    public ClaimTypeDTO getClaimTypeById(Long id) {
        return claimTypeRepository.findById(id)
            .map(claimTypeMapper::toDTO)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TYPE_NOT_FOUND,
                new String[]{id.toString()}, null));
    }

    /**
     * Retrieves a paginated list of Claim Types, filtered by search term and status.
     *
     * @param pageable the pagination information
     * @param search the search term to filter claim types by name or description (optional)
     * @param status the status filter (true for active, false for inactive) (optional)
     * @return a paginated list of ClaimTypeDTOs
     */
    @Transactional(readOnly = true)
    public Page<ClaimTypeDTO> listClaimTypes(Pageable pageable, String search, Boolean status) {
        return claimTypeRepository.findAll(ClaimTypeSpecification.byFilter(search, status), pageable)
            .map(claimTypeMapper::toDTO);
    }

    /**
     * Changes the status of a Claim Type (active/inactive).
     *
     * @param id the ID of the claim type
     * @param status the new status to be set (true for active, false for inactive)
     * @param requestInfo the request information for logging
     * @throws CustomException if the claim type is not found
     */
    public void changeStatus(Long id, Boolean status, RequestInfo requestInfo) {
        ClaimTypeEntity entity = claimTypeRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.NOT_FOUND, SepsStatusCode.CLAIM_TYPE_NOT_FOUND,
                new String[]{id.toString()}, null));
        Map<String, Object> oldData = convertEntityToMap(this.getClaimTypeById(entity.getId()));
        entity.setStatus(status);
        ClaimTypeEntity claimType = claimTypeRepository.save(entity);
        User currenUser = userService.getCurrentUser();

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.claim.type.status.change",
                new Object[]{currenUser.getEmail(), claimType.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getClaimTypeById(claimType.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        Map<String, String> req = new HashMap<>();
        req.put("status", status.toString());
        String requestBody = gson.toJson(req);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "changeStatusClaimType", ActionTypeEnum.CLAIM_TYPE_MASTER_STATUS_CHANGE.name(), claimType.getId(), ClaimTypeEntity.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.STATUS_CHANGE.name(), requestBody);
    }

    /**
     * Downloads the list of Claim Types as an Excel file, optionally filtered by search term and status.
     *
     * @param search the search term to filter claim types by name or description (optional)
     * @param status the status filter (true for active, false for inactive) (optional)
     * @return a ByteArrayInputStream representing the Excel file
     * @throws IOException if an I/O error occurs during Excel file creation
     */
    @Transactional(readOnly = true)
    public ByteArrayInputStream listClaimTypesDownload(String search, Boolean status) throws IOException {

        List<ClaimTypeEntity> dataList = claimTypeRepository.findAll(ClaimTypeSpecification.byFilter(search, status));

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Claim Types");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Id", "Name", "Description", "Status"};

            for (int col = 0; col < headers.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
            }
            // Data
            int rowIdx = 1;
            for (ClaimTypeEntity data : dataList) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(data.getId());
                row.createCell(1).setCellValue(data.getName());
                row.createCell(2).setCellValue(data.getDescription());
                row.createCell(3).setCellValue(data.getStatus().equals(true) ? Constants.ACTIVE : Constants.INACTIVE);
            }
            // Auto-size columns
            for (int col = 0; col < headers.length; col++) {
                sheet.autoSizeColumn(col);
            }
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    /**
     * Retrieves a list of active Claim Types for dropdown purposes.
     *
     * @return a list of DropdownListDTOs representing active claim types
     */
    public List<DropdownListDTO> listActiveClaimTypes() {
        return claimTypeRepository.findAllByStatus(true)
            .stream()
            .map(claimTypeMapper::toDropDownDTO)
            .toList();
    }
}
