package com.seps.admin.service;

import com.google.gson.Gson;
import com.seps.admin.config.Constants;
import com.seps.admin.domain.ProvinceEntity;
import com.seps.admin.domain.User;
import com.seps.admin.enums.ActionTypeEnum;
import com.seps.admin.enums.ActivityTypeEnum;
import com.seps.admin.enums.LanguageEnum;
import com.seps.admin.repository.ProvinceRepository;
import com.seps.admin.service.dto.DropdownListDTO;
import com.seps.admin.service.dto.ProvinceDTO;
import com.seps.admin.service.dto.RequestInfo;
import com.seps.admin.service.mapper.ProvinceMapper;
import com.seps.admin.service.specification.ProvinceSpecification;
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
 * Service class for managing Province entities.
 */
@Service
@Transactional
public class ProvinceService {

    private final ProvinceRepository provinceRepository;
    private final ProvinceMapper provinceMapper;
    private final AuditLogService auditLogService;
    private final UserService userService;
    private final MessageSource messageSource;
    private final Gson gson;

    /**
     * Constructor to inject required dependencies.
     *
     * @param provinceRepository the repository for ProvinceEntity
     * @param provinceMapper the mapper for converting between ProvinceEntity and ProvinceDTO
     * @param userService the service for UserService
     * @param messageSource the message resource for MessageSource
     */
    public ProvinceService(ProvinceRepository provinceRepository, ProvinceMapper provinceMapper, AuditLogService auditLogService, UserService userService, MessageSource messageSource,
                           Gson gson) {
        this.provinceRepository = provinceRepository;
        this.provinceMapper = provinceMapper;
        this.auditLogService = auditLogService;
        this.userService = userService;
        this.messageSource = messageSource;
        this.gson = gson;
    }

    /**
     * Adds a new Province.
     *
     * @param provinceDTO the DTO containing the details of the province
     * @param requestInfo the request info for the api header
     * @return the ID of the newly created province
     * @throws CustomException if a province with the same name already exists
     */
    public Long addProvince(ProvinceDTO provinceDTO, RequestInfo requestInfo) {
        provinceRepository.findByNameIgnoreCase(provinceDTO.getName())
            .ifPresent(existingProvince -> {
                throw new CustomException(
                    Status.BAD_REQUEST,
                    SepsStatusCode.DUPLICATE_PROVINCE,
                    new String[]{provinceDTO.getName()},
                    null
                );
            });

        ProvinceEntity entity = provinceMapper.toEntity(provinceDTO);
        entity.setStatus(true);  // Default to active
        User currenUser = userService.getCurrentUser();
        ProvinceEntity province = provinceRepository.save(entity);
        Map<String, String> auditMessageMap = new HashMap<>();
        Map<String, Object> entityData = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.province.created",
                new Object[]{currenUser.getEmail(), province.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        entityData.put(Constants.NEW_DATA,convertEntityToMap(this.getProvinceById(province.getId())));
        String requestBody = gson.toJson(provinceDTO);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "addProvince", ActionTypeEnum.PROVINCE_MASTER_ADD.name(), province.getId(), ProvinceEntity.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.DATA_ENTRY.name(), requestBody);

        return province.getId();
    }

    /**
     * Updates an existing Province.
     *
     * @param id the ID of the province to update
     * @param provinceDTO the DTO containing updated information
     * @param requestInfo the request info for the api header
     * @throws CustomException if the province is not found or a duplicate name is detected
     */
    public void updateProvince(Long id, ProvinceDTO provinceDTO, RequestInfo requestInfo) {
        ProvinceEntity entity = provinceRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.PROVINCE_NOT_FOUND,
                new String[]{id.toString()}, null));

        provinceRepository.findByNameIgnoreCase(provinceDTO.getName())
            .ifPresent(duplicateProvince -> {
                if (!duplicateProvince.getId().equals(entity.getId())) {
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.DUPLICATE_PROVINCE,
                        new String[]{provinceDTO.getName()}, null);
                }
            });
        Map<String, Object> oldData = convertEntityToMap(this.getProvinceById(entity.getId()));
        entity.setName(provinceDTO.getName());
        User currenUser = userService.getCurrentUser();
        ProvinceEntity province = provinceRepository.save(entity);
        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.province.updated",
                new Object[]{currenUser.getEmail(), province.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getProvinceById(province.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        String requestBody = gson.toJson(provinceDTO);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "updateProvince", ActionTypeEnum.PROVINCE_MASTER_EDIT.name(), province.getId(), ProvinceEntity.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);
    }

    /**
     * Retrieves a Province by its ID.
     *
     * @param id the ID of the province
     * @return the DTO representing the province
     * @throws CustomException if the province is not found
     */
    public ProvinceDTO getProvinceById(Long id) {
        return provinceRepository.findById(id)
            .map(provinceMapper::toDTO)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.PROVINCE_NOT_FOUND,
                new String[]{id.toString()}, null));
    }

    /**
     * Retrieves a paginated list of Provinces, filtered by search term and status.
     *
     * @param pageable the pagination information
     * @param search the search term to filter provinces by name (optional)
     * @param status the status filter (true for active, false for inactive) (optional)
     * @return a paginated list of ProvinceDTOs
     */
    @Transactional(readOnly = true)
    public Page<ProvinceDTO> listProvinces(Pageable pageable, String search, Boolean status) {
        return provinceRepository.findAll(ProvinceSpecification.byFilter(search, status), pageable)
            .map(provinceMapper::toDTO);
    }

    /**
     * Changes the status of a Province (active/inactive).
     *
     * @param id the ID of the province
     * @param status the new status to be set (true for active, false for inactive)
     * @param requestInfo the request info for the api header
     * @throws CustomException if the province is not found
     */
    public void changeStatus(Long id, Boolean status, RequestInfo requestInfo) {
        ProvinceEntity entity = provinceRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.NOT_FOUND, SepsStatusCode.PROVINCE_NOT_FOUND,
                new String[]{id.toString()}, null));
        Map<String, Object> oldData = convertEntityToMap(this.getProvinceById(entity.getId()));
        entity.setStatus(status);
        User currenUser = userService.getCurrentUser();
        ProvinceEntity province = provinceRepository.save(entity);

        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.province.status.change",
                new Object[]{currenUser.getEmail(), province.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getProvinceById(province.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        Map<String, String> req = new HashMap<>();
        req.put("status", status.toString());
        String requestBody = gson.toJson(req);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "changeStatusProvince", ActionTypeEnum.PROVINCE_MASTER_STATUS_CHANGE.name(), province.getId(), ProvinceEntity.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.STATUS_CHANGE.name(), requestBody);
    }

    /**
     * Exports the list of Provinces as an Excel file.
     *
     * @param search the search term to filter provinces (optional)
     * @param status the status filter (true for active, false for inactive) (optional)
     * @return a ByteArrayInputStream of the Excel file
     * @throws IOException if an error occurs during file generation
     */
    @Transactional(readOnly = true)
    public ByteArrayInputStream listProvincesDownload(String search, Boolean status) throws IOException {

        List<ProvinceEntity> dataList = provinceRepository.findAll(ProvinceSpecification.byFilter(search, status));

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Province");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Id", "Name", "Status"};

            for (int col = 0; col < headers.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
            }

            // Data
            int rowIdx = 1;
            for (ProvinceEntity data : dataList) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(data.getId());
                row.createCell(1).setCellValue(data.getName());
                row.createCell(2).setCellValue(data.getStatus().equals(true) ? Constants.ACTIVE : Constants.INACTIVE);
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
     * Retrieves a list of active Provinces for dropdown selection.
     *
     * @return a list of DropdownListDTO containing active provinces
     */
    public List<DropdownListDTO> listActiveProvince() {
        return provinceRepository.findAllByStatus(true)
            .stream()
            .map(provinceMapper::toDropDownDTO)
            .toList();
    }
}
