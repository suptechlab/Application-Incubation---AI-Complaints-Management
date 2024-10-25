package com.seps.admin.service;

import com.seps.admin.config.Constants;
import com.seps.admin.domain.ProvinceEntity;
import com.seps.admin.repository.ProvinceRepository;
import com.seps.admin.service.dto.DropdownListDTO;
import com.seps.admin.service.dto.ProvinceDTO;
import com.seps.admin.service.mapper.ProvinceMapper;
import com.seps.admin.service.specification.ProvinceSpecification;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

/**
 * Service class for managing Province entities.
 */
@Service
@Transactional
public class ProvinceService {

    private final ProvinceRepository provinceRepository;
    private final ProvinceMapper provinceMapper;

    /**
     * Constructor to inject required dependencies.
     *
     * @param provinceRepository the repository for ProvinceEntity
     * @param provinceMapper the mapper for converting between ProvinceEntity and ProvinceDTO
     */
    public ProvinceService(ProvinceRepository provinceRepository, ProvinceMapper provinceMapper) {
        this.provinceRepository = provinceRepository;
        this.provinceMapper = provinceMapper;
    }

    /**
     * Adds a new Province.
     *
     * @param provinceDTO the DTO containing the details of the province
     * @return the ID of the newly created province
     * @throws CustomException if a province with the same name already exists
     */
    public Long addProvince(ProvinceDTO provinceDTO) {
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
        return provinceRepository.save(entity).getId();
    }

    /**
     * Updates an existing Province.
     *
     * @param id the ID of the province to update
     * @param provinceDTO the DTO containing updated information
     * @throws CustomException if the province is not found or a duplicate name is detected
     */
    public void updateProvince(Long id, ProvinceDTO provinceDTO) {
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

        entity.setName(provinceDTO.getName());
        entity.setStatus(provinceDTO.getStatus());
        provinceRepository.save(entity);
    }

    /**
     * Retrieves a Province by its ID.
     *
     * @param id the ID of the province
     * @return the DTO representing the province
     * @throws CustomException if the province is not found
     */
    @Transactional(readOnly = true)
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
     * @throws CustomException if the province is not found
     */
    public void changeStatus(Long id, Boolean status) {
        ProvinceEntity entity = provinceRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.NOT_FOUND, SepsStatusCode.PROVINCE_NOT_FOUND,
                new String[]{id.toString()}, null));
        entity.setStatus(status);
        provinceRepository.save(entity);
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
