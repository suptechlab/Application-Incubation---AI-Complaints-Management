package com.seps.admin.service;

import com.google.gson.Gson;
import com.seps.admin.config.Constants;
import com.seps.admin.domain.ClaimSubTypeEntity;
import com.seps.admin.domain.ClaimTypeEntity;
import com.seps.admin.domain.User;
import com.seps.admin.enums.ActionTypeEnum;
import com.seps.admin.enums.ActivityTypeEnum;
import com.seps.admin.enums.LanguageEnum;
import com.seps.admin.repository.ClaimSubTypeRepository;
import com.seps.admin.repository.ClaimTypeRepository;
import com.seps.admin.service.dto.ClaimSubTypeDTO;
import com.seps.admin.service.dto.RequestInfo;
import com.seps.admin.service.mapper.ClaimSubTypeMapper;
import com.seps.admin.service.specification.ClaimSubTypeSpecification;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
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
 * Service class for managing Claim Sub Types.
 */
@Service
@Transactional
public class ClaimSubTypeService {

    private final ClaimSubTypeRepository claimSubTypeRepository;
    private final ClaimSubTypeMapper claimSubTypeMapper;
    private final ClaimTypeRepository claimTypeRepository;
    private final AuditLogService auditLogService;
    private final UserService userService;
    private final MessageSource messageSource;
    private final Gson gson;
    /**
     * Constructor to inject required dependencies.
     *
     * @param claimSubTypeRepository the repository for ClaimSubTypeEntity
     * @param claimSubTypeMapper the mapper for converting between ClaimSubTypeEntity and ClaimSubTypeDTO
     * @param claimTypeRepository the repository for ClaimTypeEntity
     * @param  auditLogService the service for AuditLogService
     */
    public ClaimSubTypeService(ClaimSubTypeRepository claimSubTypeRepository, ClaimSubTypeMapper claimSubTypeMapper,
                               ClaimTypeRepository claimTypeRepository, AuditLogService auditLogService, UserService userService, MessageSource messageSource,
                               Gson gson) {
        this.claimSubTypeRepository = claimSubTypeRepository;
        this.claimSubTypeMapper = claimSubTypeMapper;
        this.claimTypeRepository = claimTypeRepository;
        this.auditLogService = auditLogService;
        this.userService = userService;
        this.messageSource = messageSource;
        this.gson = gson;
    }

    /**
     * Adds a new Claim Sub Type.
     *
     * @param claimSubTypeDTO the DTO containing the details of the claim subtype
     * @return the ID of the newly created claim subtype
     * @throws CustomException if a claim subtype with the same name already exists
     */
    public Long addClaimSubType(ClaimSubTypeDTO claimSubTypeDTO, RequestInfo requestInfo) {
        claimSubTypeRepository.findByNameIgnoreCase(claimSubTypeDTO.getName())
            .ifPresent(existingClaimSubType -> {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.DUPLICATE_CLAIM_SUB_TYPE,
                    new String[]{claimSubTypeDTO.getName()}, null);
            });

        ClaimTypeEntity claimType = claimTypeRepository.findById(claimSubTypeDTO.getClaimTypeId())
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TYPE_NOT_FOUND,
                new String[]{claimSubTypeDTO.getClaimTypeId().toString()}, null));

        ClaimSubTypeEntity entity = claimSubTypeMapper.toEntity(claimSubTypeDTO);
        entity.setClaimTypeId(claimType.getId());
        entity.setStatus(true);  // Default to active
        ClaimSubTypeEntity claimSubType = claimSubTypeRepository.save(entity);
        User currenUser = userService.getCurrentUser();

        Map<String, String> auditMessageMap = new HashMap<>();
        Map<String, Object> entityData = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.claim.sub.type.created",
                new Object[]{currenUser.getEmail(), claimSubType.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        entityData.put(Constants.NEW_DATA,convertEntityToMap(this.getClaimSubTypeById(claimSubType.getId())));
        String requestBody = gson.toJson(claimSubTypeDTO);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "addClaimSubType", ActionTypeEnum.CLAIM_SUB_TYPE_MASTER_ADD.name(), claimSubType.getId(), ClaimSubTypeEntity.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.DATA_ENTRY.name(), requestBody);
        return claimSubType.getId();
    }

    /**
     * Updates an existing Claim Sub Type.
     *
     * @param id the ID of the claim subtype to update
     * @param claimSubTypeDTO the DTO containing updated information
     * @throws CustomException if the claim subtype is not found or a duplicate name is detected
     */
    public void updateClaimSubType(Long id, ClaimSubTypeDTO claimSubTypeDTO, RequestInfo requestInfo) {
        ClaimSubTypeEntity entity = claimSubTypeRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_SUB_TYPE_NOT_FOUND,
                new String[]{id.toString()}, null));

        claimSubTypeRepository.findByNameIgnoreCase(claimSubTypeDTO.getName())
            .ifPresent(duplicateClaimType -> {
                if (!duplicateClaimType.getId().equals(entity.getId())) {
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.DUPLICATE_CLAIM_SUB_TYPE,
                        new String[]{claimSubTypeDTO.getName()}, null);
                }
            });

        ClaimTypeEntity claimTypeEntity = claimTypeRepository.findById(claimSubTypeDTO.getClaimTypeId())
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TYPE_NOT_FOUND,
                new String[]{claimSubTypeDTO.getClaimTypeId().toString()}, null));
        Map<String, Object> oldData = convertEntityToMap(this.getClaimSubTypeById(entity.getId()));

        entity.setClaimTypeId(claimTypeEntity.getId());
        entity.setName(claimSubTypeDTO.getName());
        entity.setDescription(claimSubTypeDTO.getDescription());
        entity.setSlaBreachDays(claimSubTypeDTO.getSlaBreachDays());
        ClaimSubTypeEntity claimSubType = claimSubTypeRepository.save(entity);
        User currenUser = userService.getCurrentUser();

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.claim.sub.type.updated",
                new Object[]{currenUser.getEmail(), claimSubType.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getClaimSubTypeById(claimSubType.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        String requestBody = gson.toJson(claimSubTypeDTO);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "updateClaimSubType", ActionTypeEnum.CLAIM_SUB_TYPE_MASTER_ADD.name(), claimSubType.getId(), ClaimSubTypeEntity.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);
    }

    /**
     * Retrieves a Claim Sub Type by its ID.
     *
     * @param id the ID of the claim subtype
     * @return the DTO representing the claim subtype
     * @throws CustomException if the claim subtype is not found
     */
    public ClaimSubTypeDTO getClaimSubTypeById(Long id) {
        return claimSubTypeRepository.findById(id)
            .map(claimSubTypeMapper::toDTO)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_SUB_TYPE_NOT_FOUND,
                new String[]{id.toString()}, null));
    }

    /**
     * Retrieves a paginated list of Claim Sub Types, filtered by search term and status.
     *
     * @param pageable the pagination information
     * @param search the search term to filter claim subtypes by name or description (optional)
     * @param status the status filter (true for active, false for inactive) (optional)
     * @return a paginated list of ClaimSubTypeDTOs
     */
    @Transactional(readOnly = true)
    public Page<ClaimSubTypeDTO> listClaimSubTypes(Pageable pageable, String search, Boolean status) {
        return claimSubTypeRepository.findAll(ClaimSubTypeSpecification.byFilter(search, status), pageable)
            .map(claimSubTypeMapper::toDTO);
    }

    /**
     * Changes the status of a Claim Sub Type (active/inactive).
     *
     * @param id the ID of the claim subtype
     * @param status the new status to be set (true for active, false for inactive)
     * @throws CustomException if the claim subtype is not found
     */
    public void changeStatus(Long id, Boolean status, RequestInfo requestInfo) {
        ClaimSubTypeEntity entity = claimSubTypeRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_SUB_TYPE_NOT_FOUND,
                new String[]{id.toString()}, null));
        Map<String, Object> oldData = convertEntityToMap(this.getClaimSubTypeById(entity.getId()));
        entity.setStatus(status);
        ClaimSubTypeEntity claimSubType = claimSubTypeRepository.save(entity);

        User currenUser = userService.getCurrentUser();

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.claim.sub.type.status.change",
                new Object[]{currenUser.getEmail(), claimSubType.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getClaimSubTypeById(claimSubType.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        Map<String, String> req = new HashMap<>();
        req.put("status", status.toString());
        String requestBody = gson.toJson(req);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "changeStatus", ActionTypeEnum.CLAIM_SUB_TYPE_MASTER_STATUS_CHANGE.name(), claimSubType.getId(), ClaimSubTypeEntity.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.STATUS_CHANGE.name(), requestBody);
    }

    /**
     * Exports the list of Claim Sub Types as an Excel file.
     *
     * @param search the search term to filter claim subtypes (optional)
     * @param status the status filter (true for active, false for inactive) (optional)
     * @return a ByteArrayInputStream of the Excel file
     * @throws IOException if an error occurs during file generation
     */
    @Transactional(readOnly = true)
    public ByteArrayInputStream listClaimSubTypesDownload(String search, Boolean status) throws IOException {

        List<ClaimSubTypeEntity> dataList = claimSubTypeRepository.findAll(ClaimSubTypeSpecification.byFilter(search, status));

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Claim Sub Types");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Id", "Name", "Claim Type", "Description", "Status"};

            for (int col = 0; col < headers.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
            }

            // Data
            int rowIdx = 1;
            for (ClaimSubTypeEntity data : dataList) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(data.getId());
                row.createCell(1).setCellValue(data.getName());
                row.createCell(2).setCellValue(data.getClaimType().getName());
                row.createCell(3).setCellValue(data.getDescription());
                row.createCell(4).setCellValue(data.getStatus().equals(true) ? Constants.ACTIVE : Constants.INACTIVE);
            }

            // Auto-size columns
            for (int col = 0; col < headers.length; col++) {
                sheet.autoSizeColumn(col);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}
