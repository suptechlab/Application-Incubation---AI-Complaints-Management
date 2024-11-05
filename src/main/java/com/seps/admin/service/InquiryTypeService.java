package com.seps.admin.service;

import com.google.gson.Gson;
import com.seps.admin.config.Constants;
import com.seps.admin.domain.InquiryTypeEntity;
import com.seps.admin.domain.User;
import com.seps.admin.enums.ActionTypeEnum;
import com.seps.admin.enums.ActivityTypeEnum;
import com.seps.admin.enums.LanguageEnum;
import com.seps.admin.repository.InquiryTypeRepository;
import com.seps.admin.service.dto.DropdownListDTO;
import com.seps.admin.service.dto.InquiryTypeDTO;
import com.seps.admin.service.dto.RequestInfo;
import com.seps.admin.service.mapper.InquiryTypeMapper;
import com.seps.admin.service.specification.InquiryTypeSpecification;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import jakarta.validation.Valid;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
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
 * Service class for managing Inquiry Types.
 * Provides methods to add, update, retrieve, change status, and download data related to Inquiry Types.
 * This class also performs audit logging for major actions such as create, update, and status change.
 */
@Service
@Transactional
public class InquiryTypeService {

    private final InquiryTypeRepository inquiryTypeRepository;
    private final InquiryTypeMapper inquiryTypeMapper;
    private final AuditLogService auditLogService;
    private final UserService userService;
    private final MessageSource messageSource;
    private final Gson gson;

    /**
     * Constructor to initialize the service with required dependencies.
     *
     * @param inquiryTypeRepository the repository for InquiryTypeEntity operations
     * @param inquiryTypeMapper the mapper for converting between InquiryTypeDTO and InquiryTypeEntity
     * @param auditLogService the service for recording audit logs
     * @param userService the service to retrieve user information
     * @param messageSource the source for internationalized messages
     * @param gson the JSON converter
     */
    @Autowired
    public InquiryTypeService(InquiryTypeRepository inquiryTypeRepository, InquiryTypeMapper inquiryTypeMapper, AuditLogService auditLogService, UserService userService, MessageSource messageSource,
                              Gson gson) {
        this.inquiryTypeRepository = inquiryTypeRepository;
        this.inquiryTypeMapper = inquiryTypeMapper;
        this.auditLogService = auditLogService;
        this.userService = userService;
        this.messageSource = messageSource;
        this.gson = gson;
    }

    /**
     * Adds a new Inquiry Type.
     * Logs the action in the audit trail and verifies for duplicates.
     *
     * @param inquiryTypeDTO the Inquiry Type data transfer object
     * @param requestInfo additional request information
     * @return the ID of the newly created Inquiry Type
     * @throws CustomException if an Inquiry Type with the same name already exists
     */
    public Long addInquiryType(@Valid InquiryTypeDTO inquiryTypeDTO, RequestInfo requestInfo) {
        inquiryTypeRepository.findByNameIgnoreCase(inquiryTypeDTO.getName())
            .ifPresent(existingInquiryType -> {
                    throw new CustomException(
                        Status.BAD_REQUEST,
                        SepsStatusCode.DUPLICATE_INQUIRY_TYPE,
                        new String[]{ inquiryTypeDTO.getName() },
                        null
                    );
                }
            );

        InquiryTypeEntity inquiryType = inquiryTypeMapper.toEntity(inquiryTypeDTO);
        inquiryType.setStatus(true);
        InquiryTypeEntity savedInquiryType = inquiryTypeRepository.save(inquiryType);
        User currenUser = userService.getCurrentUser();

        Map<String, String> auditMessageMap = new HashMap<>();
        Map<String, Object> entityData = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.inquiry.type.created",
                new Object[]{currenUser.getEmail(), savedInquiryType.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        entityData.put(Constants.NEW_DATA,convertEntityToMap(this.getInquiryTypeById(savedInquiryType.getId())));
        String requestBody = gson.toJson(inquiryTypeDTO);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "addInquiryType", ActionTypeEnum.INQUIRY_TYPE_MASTER_ADD.name(), savedInquiryType.getId(), InquiryTypeEntity.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.DATA_ENTRY.name(), requestBody);
        return savedInquiryType.getId();
    }

    /**
     * Updates an existing Inquiry Type.
     * Logs the update action in the audit trail and checks for duplicate names.
     *
     * @param id the ID of the Inquiry Type to update
     * @param inquiryTypeDTO the updated Inquiry Type data transfer object
     * @param requestInfo additional request information
     * @throws CustomException if the Inquiry Type is not found or if a duplicate name exists
     */
    public void updateInquiryType(Long id, InquiryTypeDTO inquiryTypeDTO, RequestInfo requestInfo) {
        InquiryTypeEntity existingInquiryType = inquiryTypeRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.INQUIRY_TYPE_NOT_FOUND, new String[]{ id.toString() }, null));

        inquiryTypeRepository.findByNameIgnoreCase(inquiryTypeDTO.getName())
            .ifPresent(duplicateInquiryType -> {
                if (!duplicateInquiryType.getId().equals(existingInquiryType.getId())) {
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.DUPLICATE_INQUIRY_TYPE, new String[]{ inquiryTypeDTO.getName() }, null);
                }
            });
        Map<String, Object> oldData = convertEntityToMap(this.getInquiryTypeById(existingInquiryType.getId()));
        existingInquiryType.setName(inquiryTypeDTO.getName());
        existingInquiryType.setDescription(inquiryTypeDTO.getDescription());

        InquiryTypeEntity updatedInquiryType = inquiryTypeRepository.save(existingInquiryType);
        User currenUser = userService.getCurrentUser();

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.inquiry.type.updated",
                new Object[]{currenUser.getEmail(), updatedInquiryType.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getInquiryTypeById(updatedInquiryType.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        String requestBody = gson.toJson(inquiryTypeDTO);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "updateInquiryType", ActionTypeEnum.INQUIRY_TYPE_MASTER_EDIT.name(), updatedInquiryType.getId(), InquiryTypeEntity.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);
    }

    /**
     * Retrieves an Inquiry Type by its ID.
     *
     * @param id the ID of the Inquiry Type
     * @return the Inquiry Type DTO
     * @throws CustomException if the Inquiry Type is not found
     */
    public InquiryTypeDTO getInquiryTypeById(Long id) {
        return inquiryTypeRepository.findById(id)
            .map(inquiryTypeMapper::toDTO)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.INQUIRY_TYPE_NOT_FOUND, new String[]{ id.toString() }, null));
    }

    /**
     * Retrieves a paginated list of all Inquiry Types, with an optional search filter.
     *
     * @param pageable the pagination information
     * @param search the search keyword to filter Inquiry Types by name or description (optional)
     * @return a paginated list of Inquiry Type DTOs
     */
    @Transactional(readOnly = true)
    public Page<InquiryTypeDTO> getAllInquiryTypes(Pageable pageable, String search, Boolean status) {

        return inquiryTypeRepository.findAll(InquiryTypeSpecification.byFilter(search, status), pageable)
                .map(inquiryTypeMapper::toDTO);

    }

    /**
     * Changes the status of an Inquiry Type.
     * Logs the status change in the audit trail.
     *
     * @param inquiryTypeId the ID of the Inquiry Type
     * @param status the new status (true for active, false for inactive)
     * @param requestInfo additional request information
     * @throws CustomException if the Inquiry Type is not found
     */
    @Transactional
    public void changeStatus(Long inquiryTypeId, Boolean status, RequestInfo requestInfo) {
        InquiryTypeEntity inquiryType = inquiryTypeRepository.findById(inquiryTypeId)
            .orElseThrow(() -> new CustomException(
                Status.NOT_FOUND,
                SepsStatusCode.INQUIRY_TYPE_NOT_FOUND,
                new String[]{ inquiryTypeId.toString() },
                null
            ));
        Map<String, Object> oldData = convertEntityToMap(this.getInquiryTypeById(inquiryType.getId()));
        inquiryType.setStatus(status);
        InquiryTypeEntity updatedInquiryType = inquiryTypeRepository.save(inquiryType);

        User currenUser = userService.getCurrentUser();

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.inquiry.type.status.change",
                new Object[]{currenUser.getEmail(), updatedInquiryType.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getInquiryTypeById(updatedInquiryType.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        Map<String, String> req = new HashMap<>();
        req.put("status", status.toString());
        String requestBody = gson.toJson(req);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "changeStatus", ActionTypeEnum.INQUIRY_TYPE_MASTER_STATUS_CHANGE.name(), updatedInquiryType.getId(), InquiryTypeEntity.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.STATUS_CHANGE.name(), requestBody);
    }

    /**
     * Generates and downloads an Excel file of Inquiry Types with optional filters.
     * Includes headers and data rows for each Inquiry Type record.
     *
     * @param search the search keyword to filter Inquiry Types by name or description (optional)
     * @param status the status filter (optional)
     * @return a ByteArrayInputStream of the generated Excel file
     * @throws IOException if an error occurs during file creation
     */
    @Transactional(readOnly = true)
    public ByteArrayInputStream listInquiryTypesDownload(String search, Boolean status) throws IOException {

        List<InquiryTypeEntity> dataList = inquiryTypeRepository.findAll(InquiryTypeSpecification.byFilter(search, status));

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Inquiry Types");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Id", "Name", "Description", "Status"};

            for (int col = 0; col < headers.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
            }
            // Data
            int rowIdx = 1;
            for (InquiryTypeEntity data : dataList) {
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
     * Retrieves a list of all active Inquiry Types for dropdown selection.
     *
     * @return a list of active Inquiry Type DTOs
     */
    @Transactional(readOnly = true)
    public List<DropdownListDTO> listActiveInquiryTypes() {
        return inquiryTypeRepository.findAllByStatus(true)
            .stream()
            .map(inquiryTypeMapper::toDropDownDTO)
            .toList();
    }
}
