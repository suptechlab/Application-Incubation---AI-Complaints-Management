package com.seps.admin.service;

import com.google.gson.Gson;
import com.seps.admin.config.Constants;
import com.seps.admin.domain.CityEntity;
import com.seps.admin.domain.ProvinceEntity;
import com.seps.admin.domain.User;
import com.seps.admin.enums.ActionTypeEnum;
import com.seps.admin.enums.ActivityTypeEnum;
import com.seps.admin.enums.LanguageEnum;
import com.seps.admin.repository.CityRepository;
import com.seps.admin.repository.ProvinceRepository;
import com.seps.admin.service.dto.CityDTO;
import com.seps.admin.service.dto.RequestInfo;
import com.seps.admin.service.mapper.CityMapper;
import com.seps.admin.service.specification.CitySpecification;
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
 * Service class for managing City entities.
 */
@Service
@Transactional
public class CityService {

    private final CityRepository cityRepository;
    private final CityMapper cityMapper;
    private final ProvinceRepository provinceRepository;
    private final AuditLogService auditLogService;
    private final UserService userService;
    private final MessageSource messageSource;
    private final Gson gson;
    /**
     * Constructor to inject required dependencies.
     *
     * @param cityRepository the repository for CityEntity
     * @param cityMapper the mapper for converting between CityEntity and CityDTO
     * @param provinceRepository the repository for ProvinceEntity
     * @param auditLogService the service for AuditLogService
     * @param userService the service for UserService
     * @param messageSource the message resource for MessageSource
     */
    public CityService(CityRepository cityRepository, CityMapper cityMapper, ProvinceRepository provinceRepository,
                       AuditLogService auditLogService, UserService userService, MessageSource messageSource,
                       Gson gson) {
        this.cityRepository = cityRepository;
        this.cityMapper = cityMapper;
        this.provinceRepository = provinceRepository;
        this.auditLogService = auditLogService;
        this.userService = userService;
        this.messageSource = messageSource;
        this.gson = gson;
    }

    /**
     * Adds a new City.
     *
     * @param cityDTO     the DTO containing the details of the city
     * @param requestInfo the request info for the api header
     * @return the ID of the newly created city
     * @throws CustomException if a city with the same name already exists or if the province is not found
     */
    public Long addCity(CityDTO cityDTO, RequestInfo requestInfo) {
        cityRepository.findByNameIgnoreCase(cityDTO.getName())
            .ifPresent(existingCity -> {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.DUPLICATE_CITY,
                    new String[]{cityDTO.getName()}, null);
            });

        ProvinceEntity provinceEntity = provinceRepository.findById(cityDTO.getProvinceId())
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.PROVINCE_NOT_FOUND,
                new String[]{cityDTO.getProvinceId().toString()}, null));

        cityDTO.setProvinceId(provinceEntity.getId());
        CityEntity entity = cityMapper.toEntity(cityDTO);
        entity.setStatus(true);  // Default to active
        User currenUser = userService.getCurrentUser();
        CityEntity city = cityRepository.saveAndFlush(entity);

        Map<String, String> auditMessageMap = new HashMap<>();
        Map<String, Object> entityData = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.city.created",
                new Object[]{currenUser.getEmail(), city.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        entityData.put(Constants.NEW_DATA,convertEntityToMap(this.getCityById(city.getId())));
        String requestBody = gson.toJson(cityDTO);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "addCity", ActionTypeEnum.CITY_MASTER_ADD.name(), city.getId(), CityEntity.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.DATA_ENTRY.name(), requestBody);
        return city.getId();

    }

    /**
     * Updates an existing City.
     *
     * @param id         the ID of the city to update
     * @param cityDTO    the DTO containing the updated city details
     * @param requestInfo the request information for the API header
     * @throws CustomException if the city or province is not found or if a duplicate city name is detected
     */
    public void updateCity(Long id, CityDTO cityDTO, RequestInfo requestInfo) {
        CityEntity entity = cityRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CITY_NOT_FOUND,
                new String[]{id.toString()}, null));

        cityRepository.findByNameIgnoreCase(cityDTO.getName())
            .ifPresent(duplicateCity -> {
                if (!duplicateCity.getId().equals(entity.getId())) {
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.DUPLICATE_CITY,
                        new String[]{cityDTO.getName()}, null);
                }
            });

        ProvinceEntity province = provinceRepository.findById(cityDTO.getProvinceId())
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.PROVINCE_NOT_FOUND,
                new String[]{cityDTO.getProvinceId().toString()}, null));
        Map<String, Object> oldData = convertEntityToMap(this.getCityById(entity.getId()));
        entity.setName(cityDTO.getName());
        entity.setProvinceId(province.getId());
        User currenUser = userService.getCurrentUser();

        CityEntity city = cityRepository.save(entity);

        Map<String, String> auditMessageMap = new HashMap<>();

        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.city.updated",
                new Object[]{currenUser.getEmail(), city.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getCityById(city.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        String requestBody = gson.toJson(cityDTO);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "updateCity", ActionTypeEnum.CITY_MASTER_EDIT.name(), city.getId(), CityEntity.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);
    }

    /**
     * Retrieves a City by its ID.
     *
     * @param id the ID of the city to retrieve
     * @return the DTO representing the city
     * @throws CustomException if the city is not found
     */
    //@Transactional(readOnly = true)
    public CityDTO getCityById(Long id) {
        return cityRepository.findById(id)
            .map(cityMapper::toDTO)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CITY_NOT_FOUND,
                new String[]{id.toString()}, null));
    }

    /**
     * Retrieves a paginated list of Cities, filtered by search term and status.
     *
     * @param pageable the pagination information
     * @param search the search term to filter cities by name (optional)
     * @param status the status filter (true for active, false for inactive) (optional)
     * @return a paginated list of CityDTOs
     */
    @Transactional(readOnly = true)
    public Page<CityDTO> listCities(Pageable pageable, String search, Boolean status) {
        return cityRepository.findAll(CitySpecification.byFilter(search, status), pageable)
            .map(cityMapper::toDTO);
    }

    /**
     * Changes the status of a City (active/inactive).
     *
     * @param id         the ID of the city to change status for
     * @param status     the new status (true for active, false for inactive)
     * @param requestInfo the request information for the API header
     * @throws CustomException if the city is not found
     */
    public void changeStatus(Long id, Boolean status, RequestInfo requestInfo) {
        CityEntity entity = cityRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CITY_NOT_FOUND,
                new String[]{id.toString()}, null));
        Map<String, Object> oldData = convertEntityToMap(this.getCityById(entity.getId()));
        entity.setStatus(status);
        User currenUser = userService.getCurrentUser();
        CityEntity city = cityRepository.save(entity);
        Map<String, String> auditMessageMap = new HashMap<>();
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("audit.log.city.status.change",
                new Object[]{currenUser.getEmail(), city.getId()}, Locale.forLanguageTag(language.getCode()));
            auditMessageMap.put(language.getCode(), messageAudit);
        });
        Map<String, Object> entityData = new HashMap<>();
        Map<String, Object> newData = convertEntityToMap(this.getCityById(city.getId()));
        entityData.put(Constants.OLD_DATA, oldData);
        entityData.put(Constants.NEW_DATA, newData);
        Map<String, Object> req = new HashMap<>();
        req.put("status", status.toString());
        String requestBody = gson.toJson(req);
        auditLogService.logActivity(null, currenUser.getId(), requestInfo, "changeStatusCity", ActionTypeEnum.CITY_MASTER_STATUS_CHANGE.name(), city.getId(), CityEntity.class.getSimpleName(),
            null, auditMessageMap,entityData, ActivityTypeEnum.STATUS_CHANGE.name(), requestBody);
    }

    /**
     * Exports the list of Cities as an Excel file.
     *
     * @param search the search term to filter cities (optional)
     * @param status the status filter (true for active, false for inactive) (optional)
     * @return a ByteArrayInputStream of the Excel file
     * @throws IOException if an error occurs during file generation
     */
    @Transactional(readOnly = true)
    public ByteArrayInputStream listCitiesDownload(String search, Boolean status) throws IOException {

        List<CityEntity> dataList = cityRepository.findAll(CitySpecification.byFilter(search, status));

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Cities");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Id", "Name", "Province", "Status"};

            for (int col = 0; col < headers.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
            }

            // Data
            int rowIdx = 1;
            for (CityEntity data : dataList) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(data.getId());
                row.createCell(1).setCellValue(data.getName());
                row.createCell(2).setCellValue(data.getProvince().getName());
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
}
