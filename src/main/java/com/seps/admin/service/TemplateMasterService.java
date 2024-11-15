package com.seps.admin.service;

import com.google.gson.Gson;
import com.seps.admin.config.Constants;
import com.seps.admin.domain.TemplateMaster;
import com.seps.admin.domain.User;
import com.seps.admin.enums.ActionTypeEnum;
import com.seps.admin.enums.ActivityTypeEnum;
import com.seps.admin.enums.LanguageEnum;
import com.seps.admin.enums.TemplateTypeEnum;
import com.seps.admin.repository.TemplateMasterRepository;
import com.seps.admin.service.dto.RequestInfo;
import com.seps.admin.service.dto.TemplateMasterDTO;
import com.seps.admin.service.mapper.TemplateMasterMapper;
import com.seps.admin.service.specification.TemplateMasterSpecification;
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
 * Service class for managing TemplateMaster entities.
 * Provides methods for creating, updating, retrieving, and changing the status of templates.
 */
@Service
@Transactional
public class TemplateMasterService {

    private final TemplateMasterRepository repository;
    private final TemplateMasterMapper templateMasterMapper;
    private final AuditLogService auditLogService;
    private final UserService userService;
    private final MessageSource messageSource;
    private final Gson gson;

    /**
     * Constructor for TemplateMasterService.
     *
     * @param repository            the repository for TemplateMaster entities
     * @param templateMasterMapper  the mapper for converting between entity and DTO
     * @param auditLogService       the service for logging audit activities
     * @param userService           the service for retrieving user information
     * @param messageSource         the source for retrieving localized messages
     * @param gson                  the Gson instance for JSON conversion
     */
    public TemplateMasterService(TemplateMasterRepository repository, TemplateMasterMapper templateMasterMapper,
                                 AuditLogService auditLogService, UserService userService,
                                 MessageSource messageSource, Gson gson) {
        this.repository = repository;
        this.templateMasterMapper = templateMasterMapper;
        this.auditLogService = auditLogService;
        this.userService = userService;
        this.messageSource = messageSource;
        this.gson = gson;
    }

    /**
     * Creates a new TemplateMaster entity.
     *
     * @param templateMasterDTO the DTO containing template data
     * @param requestInfo       the request information for auditing
     * @return the ID of the newly created template
     */
    public Long createTemplate(@Valid TemplateMasterDTO templateMasterDTO, RequestInfo requestInfo) {
        if (repository.existsByTemplateNameIgnoreCase(templateMasterDTO.getTemplateName())) {
            throw new CustomException(
                    Status.BAD_REQUEST,
                    SepsStatusCode.DUPLICATE_TEMPLATE,
                    new String[]{templateMasterDTO.getTemplateName()},
                    null
            );
        }
        User currentUser = userService.getCurrentUser();
        TemplateMaster template = templateMasterMapper.mapToEntity(templateMasterDTO);
        template.setCreatedBy(currentUser.getId());
        TemplateMasterDTO savedTemplateMaster = templateMasterMapper.mapToDTO(repository.save(template));
        Map<String, String> auditMessageMap = new HashMap<>();
        Map<String, Object> entityData = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.template.created",
                    new Object[]{currentUser.getEmail(), savedTemplateMaster.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        entityData.put(Constants.NEW_DATA, convertEntityToMap(savedTemplateMaster));
        String requestBody = gson.toJson(templateMasterDTO);
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "createTemplate",
                ActionTypeEnum.TEMPLATE_MASTER_ADD.name(), savedTemplateMaster.getId(),
                TemplateMaster.class.getSimpleName(), null, auditMessageMap, entityData,
                ActivityTypeEnum.DATA_ENTRY.name(), requestBody);
        return savedTemplateMaster.getId();
    }

    /**
     * Retrieves a TemplateMaster by its template key.
     *
     * @param templateKey the key of the template
     * @return an optional containing the DTO of the template if found
     */
    public Optional<TemplateMasterDTO> findByTemplateKey(String templateKey) {
        return repository.findByTemplateKeyIgnoreCase(templateKey).map(templateMasterMapper::mapToDTO);
    }

    /**
     * Retrieves a TemplateMaster by its ID.
     *
     * @param id the ID of the template
     * @return the DTO of the template
     * @throws CustomException if the template is not found
     */
    public TemplateMasterDTO getTemplateById(Long id) {
        return repository.findById(id)
                .map(templateMasterMapper::mapToDTO)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.TEMPLATE_NOT_FOUND,
                        new String[]{id.toString()}, null));
    }

    /**
     * Updates an existing TemplateMaster.
     *
     * @param id          the ID of the template to update
     * @param dto         the DTO containing updated data
     * @param requestInfo the request information for auditing
     */
    public void updateTemplate(Long id, @Valid TemplateMasterDTO dto, RequestInfo requestInfo) {
        TemplateMaster entity = repository.findById(id)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.TEMPLATE_NOT_FOUND,
                        new String[]{id.toString()}, null));

        repository.findByTemplateNameIgnoreCase(dto.getTemplateName())
                .ifPresent(duplicateTemplate -> {
                    if (!duplicateTemplate.getId().equals(entity.getId())) {
                        throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.DUPLICATE_TEMPLATE,
                                new String[]{dto.getTemplateName()}, null);
                    }
                });
        User currentUser = userService.getCurrentUser();
        Map<String, Object> oldData = convertEntityToMap(this.getTemplateById(entity.getId()));
        entity.setTemplateName(dto.getTemplateName());
        entity.setContent(dto.getContent());
        entity.setUpdatedBy(currentUser.getId());
        entity.setTemplateType(dto.getTemplateType().name());

        TemplateMaster template = repository.save(entity);

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.template.updated",
                    new Object[]{currentUser.getEmail(), template.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getTemplateById(template.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        String requestBody = gson.toJson(dto);
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "updateTemplate",
                ActionTypeEnum.TEMPLATE_MASTER_EDIT.name(), template.getId(),
                TemplateMaster.class.getSimpleName(), null, auditMessageMap, entityData,
                ActivityTypeEnum.MODIFICATION.name(), requestBody);
    }

    /**
     * Retrieves a paginated list of TemplateMaster entities based on filters.
     *
     * @param pageable     the pagination information
     * @param search       the search term for filtering by template name
     * @param status       the status filter (active/inactive)
     * @param templateType the type of template filter
     * @return a page of TemplateMasterDTO
     */
    @Transactional(readOnly = true)
    public Page<TemplateMasterDTO> listTemplates(Pageable pageable, String search, Boolean status, TemplateTypeEnum templateType) {
        return repository.findAll(TemplateMasterSpecification.byFilter(search, status, templateType), pageable)
                .map(templateMasterMapper::toDTO);
    }

    /**
     * Changes the status of a TemplateMaster.
     *
     * @param id          the ID of the template to change status
     * @param status      the new status (true for active, false for inactive)
     * @param requestInfo the request information for auditing
     */
    public void changeStatus(Long id, Boolean status, RequestInfo requestInfo) {
        TemplateMaster entity = repository.findById(id)
                .orElseThrow(() -> new CustomException(Status.NOT_FOUND, SepsStatusCode.TEMPLATE_NOT_FOUND,
                        new String[]{id.toString()}, null));
        Map<String, Object> oldData = convertEntityToMap(this.getTemplateById(entity.getId()));
        entity.setStatus(status);
        User currentUser = userService.getCurrentUser();
        TemplateMaster template = repository.save(entity);

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.template.status.change",
                    new Object[]{currentUser.getEmail(), template.getStatus()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getTemplateById(template.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        Map<String, String> req = new HashMap<>();
        req.put("status", status.toString());
        String requestBody = gson.toJson(req);
        auditLogService.logActivity(null, currentUser.getId(), requestInfo, "changeStatus",
                ActionTypeEnum.TEMPLATE_MASTER_EDIT.name(), template.getId(),
                TemplateMaster.class.getSimpleName(), null, auditMessageMap, entityData,
                ActivityTypeEnum.MODIFICATION.name(), requestBody);
    }

    /**
     * Generates an Excel file containing a list of templates that match the provided filter criteria.
     * The Excel file contains a header row with column names and a data section with template information
     * such as ID, name, type, subject, content, creator, status, and creation date.
     *
     * @param search       The search term used to filter templates by name or other relevant fields.
     * @param status       The status filter for templates (e.g., active or inactive).
     * @param templateType The type of the template (e.g., EMAIL, NOTIFICATION).
     * @return A ByteArrayInputStream containing the Excel file data that can be used for file download.
     * @throws IOException If an error occurs while generating the Excel file.
     */
    @Transactional(readOnly = true)
    public ByteArrayInputStream listTemplatesDownloadExcel(String search, Boolean status, TemplateTypeEnum templateType) throws IOException {

        List<TemplateMaster> dataList = repository.findAll(TemplateMasterSpecification.byFilter(search, status, templateType));

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Templates");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Id", "Name", "Type", "Subject", "Content", "Created by", "Status", "Crated Date"};

            for (int col = 0; col < headers.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
            }

            // Data
            int rowIdx = 1;
            for (TemplateMaster data : dataList) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(data.getId());
                row.createCell(1).setCellValue(data.getTemplateName());
                row.createCell(2).setCellValue(data.getTemplateType());
                row.createCell(3).setCellValue(data.getSubject());
                row.createCell(4).setCellValue(data.getContent());
                row.createCell(5).setCellValue(data.getUserCreatedBy().getFirstName());
                row.createCell(6).setCellValue(data.getStatus().equals(true) ? Constants.ACTIVE : Constants.INACTIVE);
                row.createCell(7).setCellValue(data.getCreatedAt().toString());
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
