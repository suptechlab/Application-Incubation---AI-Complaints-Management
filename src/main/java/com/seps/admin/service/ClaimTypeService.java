package com.seps.admin.service;

import com.seps.admin.config.Constants;
import com.seps.admin.domain.ClaimTypeEntity;
import com.seps.admin.repository.ClaimTypeRepository;
import com.seps.admin.service.dto.ClaimTypeDTO;
import com.seps.admin.service.dto.DropdownListDTO;
import com.seps.admin.service.mapper.ClaimTypeMapper;
import com.seps.admin.service.specification.ClaimTypeSpecification;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import org.apache.poi.ss.usermodel.*;
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
 * Service class for managing Claim Types.
 */
@Service
@Transactional
public class ClaimTypeService {

    private final ClaimTypeRepository claimTypeRepository;
    private final ClaimTypeMapper claimTypeMapper;

    /**
     * Constructor to inject required dependencies.
     *
     * @param claimTypeRepository the repository for ClaimTypeEntity
     * @param claimTypeMapper the mapper for converting between ClaimTypeEntity and ClaimTypeDTO
     */
    public ClaimTypeService(ClaimTypeRepository claimTypeRepository, ClaimTypeMapper claimTypeMapper) {
        this.claimTypeRepository = claimTypeRepository;
        this.claimTypeMapper = claimTypeMapper;
    }

    /**
     * Adds a new Claim Type.
     *
     * @param claimTypeDTO the DTO containing the details of the claim type
     * @return the ID of the newly created claim type
     * @throws CustomException if a claim type with the same name already exists
     */
    public Long addClaimType(ClaimTypeDTO claimTypeDTO) {
        claimTypeRepository.findByNameIgnoreCase(claimTypeDTO.getName())
            .ifPresent(existingClaimType -> {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.DUPLICATE_CLAIM_TYPE,
                    new String[]{claimTypeDTO.getName()}, null);
            });
        ClaimTypeEntity entity = claimTypeMapper.toEntity(claimTypeDTO);
        entity.setStatus(true);  // Default to active
        return claimTypeRepository.save(entity).getId();
    }

    /**
     * Updates an existing Claim Type.
     *
     * @param id the ID of the claim type to update
     * @param claimTypeDTO the DTO containing updated information
     * @throws CustomException if the claim type is not found or a duplicate name is detected
     */
    public void updateClaimType(Long id, ClaimTypeDTO claimTypeDTO) {
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

        entity.setName(claimTypeDTO.getName());
        entity.setDescription(claimTypeDTO.getDescription());
        claimTypeRepository.save(entity);
    }

    /**
     * Retrieves a Claim Type by its ID.
     *
     * @param id the ID of the claim type
     * @return the DTO representing the claim type
     * @throws CustomException if the claim type is not found
     */
    @Transactional(readOnly = true)
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
     * @throws CustomException if the claim type is not found
     */
    public void changeStatus(Long id, Boolean status) {
        ClaimTypeEntity entity = claimTypeRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.NOT_FOUND, SepsStatusCode.CLAIM_TYPE_NOT_FOUND,
                new String[]{id.toString()}, null));
        entity.setStatus(status);
        claimTypeRepository.save(entity);
    }

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

    public List<DropdownListDTO> listActiveInquiryTypes() {
        return claimTypeRepository.findAllByStatus(true)
            .stream()
            .map(claimTypeMapper::toDropDownDTO)
            .toList();
    }
}
