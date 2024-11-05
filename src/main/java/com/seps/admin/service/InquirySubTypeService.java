package com.seps.admin.service;

import com.google.gson.Gson;
import com.seps.admin.config.Constants;
import com.seps.admin.domain.InquirySubTypeEntity;
import com.seps.admin.domain.InquiryTypeEntity;
import com.seps.admin.domain.User;
import com.seps.admin.enums.ActionTypeEnum;
import com.seps.admin.enums.ActivityTypeEnum;
import com.seps.admin.enums.LanguageEnum;
import com.seps.admin.repository.InquirySubTypeRepository;
import com.seps.admin.repository.InquiryTypeRepository;
import com.seps.admin.service.dto.InquirySubTypeDTO;
import com.seps.admin.service.dto.RequestInfo;
import com.seps.admin.service.mapper.InquirySubTypeMapper;
import com.seps.admin.service.specification.InquirySubTypeSpecification;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import jakarta.validation.Valid;
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
 * Service class for managing Inquiry Sub Types, providing functionalities to add, update, retrieve,
 * change status, and download Inquiry Sub Type data.
 */
@Service
@Transactional
public class InquirySubTypeService {

    private final InquirySubTypeRepository inquirySubTypeRepository;
    private final InquirySubTypeMapper mapper;
    private final InquiryTypeRepository inquiryTypeRepository;
    private final AuditLogService auditLogService;
    private final UserService userService;
    private final MessageSource messageSource;
    private final Gson gson;
    /**
     * Constructor to inject required repositories and mappers.
     *
     * @param inquirySubTypeRepository the inquiry subtype repository
     * @param mapper the inquiry subtype mapper
     * @param inquiryTypeRepository the inquiry type repository
     */
    public InquirySubTypeService(InquirySubTypeRepository inquirySubTypeRepository, InquirySubTypeMapper mapper,
                                 InquiryTypeRepository inquiryTypeRepository, AuditLogService auditLogService, UserService userService, MessageSource messageSource,
                                 Gson gson) {
        this.inquirySubTypeRepository = inquirySubTypeRepository;
        this.mapper = mapper;
        this.inquiryTypeRepository = inquiryTypeRepository;
        this.auditLogService = auditLogService;
        this.userService = userService;
        this.messageSource = messageSource;
        this.gson = gson;
    }

    /**
     * Adds a new Inquiry Sub Type.
     *
     * @param inquirySubTypeDTO the DTO containing the details of the inquiry subtype
     * @param requestInfo additional request information
     * @return the ID of the newly created inquiry subtype
     * @throws CustomException if a duplicate name or invalid inquiry type is found
     */
    public Long addInquirySubType(@Valid InquirySubTypeDTO inquirySubTypeDTO, RequestInfo requestInfo) {
        inquirySubTypeRepository.findByNameIgnoreCase(inquirySubTypeDTO.getName())
            .ifPresent(existing -> {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.DUPLICATE_INQUIRY_SUB_TYPE,
                    new String[]{inquirySubTypeDTO.getName()}, null);
            });

        InquiryTypeEntity inquiryType = inquiryTypeRepository.findByIdAndStatusTrue(inquirySubTypeDTO.getInquiryTypeId())
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.INQUIRY_TYPE_NOT_FOUND,
                new String[]{inquirySubTypeDTO.getInquiryTypeId().toString()}, null));

        InquirySubTypeEntity entity = mapper.toEntity(inquirySubTypeDTO);
        entity.setInquiryTypeId(inquiryType.getId());
        entity.setStatus(true); // Set status to active by default
        InquirySubTypeEntity saved = inquirySubTypeRepository.save(entity);
        User currenUser = userService.getCurrentUser();

        Map<String, String> auditMessageMap = new HashMap<>();
        Map<String, Object> entityData = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.inquiry.sub.type.created",
                new Object[]{currenUser.getEmail(), saved.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        entityData.put(Constants.NEW_DATA,convertEntityToMap(this.getInquirySubTypeById(saved.getId())));
        String requestBody = gson.toJson(inquirySubTypeDTO);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "addInquirySubType", ActionTypeEnum.INQUIRY_SUB_TYPE_MASTER_ADD.name(), saved.getId(), InquirySubTypeEntity.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.DATA_ENTRY.name(), requestBody);
        return saved.getId();
    }

    /**
     * Updates an existing Inquiry Sub Type.
     *
     * @param id  the ID of the inquiry subtype to update
     * @param dto the DTO containing updated information
     * @param requestInfo additional request information
     * @throws CustomException if a duplicate name or invalid inquiry type is found
     */
    public void updateInquirySubType(Long id, InquirySubTypeDTO dto, RequestInfo requestInfo) {
        InquirySubTypeEntity entity = inquirySubTypeRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.INQUIRY_SUB_TYPE_NOT_FOUND,
                new String[]{id.toString()}, null));

        inquirySubTypeRepository.findByNameIgnoreCase(dto.getName())
            .ifPresent(duplicate -> {
                if (!duplicate.getId().equals(entity.getId())) {
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.DUPLICATE_INQUIRY_SUB_TYPE,
                        new String[]{dto.getName()}, null);
                }
            });

        InquiryTypeEntity inquiryTypeEntity = inquiryTypeRepository.findByIdAndStatusTrue(dto.getInquiryTypeId())
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.INQUIRY_TYPE_NOT_FOUND,
                new String[]{dto.getInquiryTypeId().toString()}, null));
        Map<String, Object> oldData = convertEntityToMap(this.getInquirySubTypeById(entity.getId()));
        entity.setInquiryTypeId(inquiryTypeEntity.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        InquirySubTypeEntity inquirySubType = inquirySubTypeRepository.save(entity);

        User currenUser = userService.getCurrentUser();

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.inquiry.sub.type.updated",
                new Object[]{currenUser.getEmail(), inquirySubType.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getInquirySubTypeById(inquirySubType.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        String requestBody = gson.toJson(dto);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "updateInquirySubType", ActionTypeEnum.INQUIRY_SUB_TYPE_MASTER_EDIT.name(), inquirySubType.getId(), InquirySubTypeEntity.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);
    }

    /**
     * Retrieves a paginated list of Inquiry Sub Types, filtered by search criteria and status.
     *
     * @param pageable the pagination information
     * @param search   the search filter (optional)
     * @param status   the status filter (optional)
     * @return a paginated list of Inquiry Sub Type DTOs
     */
    @Transactional(readOnly = true)
    public Page<InquirySubTypeDTO> listInquirySubTypes(Pageable pageable, String search, Boolean status) {
        return inquirySubTypeRepository.findAll(InquirySubTypeSpecification.byFilter(search, status), pageable)
            .map(mapper::toDTO);
    }

    /**
     * Changes the status of an Inquiry Sub Type.
     *
     * @param id     the ID of the inquiry subtype to update
     * @param status the new status to be set
     * @param requestInfo additional request information
     * @throws CustomException if the inquiry subtype is not found
     */
    @Transactional
    public void changeStatus(Long id, Boolean status, RequestInfo requestInfo) {
        InquirySubTypeEntity entity = inquirySubTypeRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.INQUIRY_SUB_TYPE_NOT_FOUND,
                new String[]{id.toString()}, null));
        Map<String, Object> oldData = convertEntityToMap(this.getInquirySubTypeById(entity.getId()));
        entity.setStatus(status);
        InquirySubTypeEntity inquirySubType = inquirySubTypeRepository.save(entity);

        User currenUser = userService.getCurrentUser();

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.inquiry.sub.type.status.change",
                new Object[]{currenUser.getEmail(), inquirySubType.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getInquirySubTypeById(inquirySubType.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        Map<String, String> req = new HashMap<>();
        req.put("status", status.toString());
        String requestBody = gson.toJson(req);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "changeStatus", ActionTypeEnum.INQUIRY_SUB_TYPE_MASTER_STATUS_CHANGE.name(), inquirySubType.getId(), InquirySubTypeEntity.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.STATUS_CHANGE.name(), requestBody);
    }

    /**
     * Retrieves an Inquiry Sub Type by its ID.
     *
     * @param id the ID of the inquiry subtype
     * @return the DTO representing the inquiry subtype
     * @throws CustomException if the inquiry subtype is not found
     */
    public InquirySubTypeDTO getInquirySubTypeById(Long id) {
        return inquirySubTypeRepository.findById(id)
            .map(mapper::toDTO)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.INQUIRY_SUB_TYPE_NOT_FOUND,
                new String[]{id.toString()}, null));
    }

    /**
     * Downloads a list of Inquiry Sub Types based on filters as an Excel file.
     *
     * @param search the search filter (optional)
     * @param status the status filter (optional)
     * @return an input stream of the generated Excel file containing the inquiry subtypes
     * @throws IOException if an error occurs while generating the Excel file
     */
    @Transactional(readOnly = true)
    public ByteArrayInputStream listInquirySubTypesDownload(String search, Boolean status) throws IOException {

        List<InquirySubTypeEntity> dataList = inquirySubTypeRepository.findAll(InquirySubTypeSpecification.byFilter(search, status));

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Inquiry Sub Types");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Id", "Name", "Inquiry Type", "Description", "Status"};

            for (int col = 0; col < headers.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
            }
            // Data
            int rowIdx = 1;
            for (InquirySubTypeEntity data : dataList) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(data.getId());
                row.createCell(1).setCellValue(data.getName());
                row.createCell(2).setCellValue(data.getInquiryType().getName());
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
