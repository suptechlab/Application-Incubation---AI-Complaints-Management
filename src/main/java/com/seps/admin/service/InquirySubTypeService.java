package com.seps.admin.service;

import com.seps.admin.config.Constants;
import com.seps.admin.domain.ClaimTypeEntity;
import com.seps.admin.domain.InquirySubTypeEntity;
import com.seps.admin.repository.InquirySubTypeRepository;
import com.seps.admin.repository.InquiryTypeRepository;
import com.seps.admin.service.dto.DropdownListDTO;
import com.seps.admin.service.dto.InquirySubTypeDTO;
import com.seps.admin.service.mapper.InquirySubTypeMapper;
import com.seps.admin.service.mapper.InquiryTypeMapper;
import com.seps.admin.service.specification.ClaimTypeSpecification;
import com.seps.admin.service.specification.InquirySubTypeSpecification;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import jakarta.validation.Valid;
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
 * Service class for managing Inquiry Sub Types.
 */
@Service
@Transactional
public class InquirySubTypeService {

    private final InquirySubTypeRepository inquirySubTypeRepository;
    private final InquirySubTypeMapper mapper;
    private final InquiryTypeRepository inquiryTypeRepository;
    private final InquiryTypeMapper inquiryTypeMapper;

    /**
     * Constructor to inject required repositories and mappers.
     *
     * @param inquirySubTypeRepository the inquiry sub-type repository
     * @param mapper the inquiry sub-type mapper
     * @param inquiryTypeRepository the inquiry type repository
     * @param inquiryTypeMapper the inquiry type mapper
     */
    public InquirySubTypeService(InquirySubTypeRepository inquirySubTypeRepository, InquirySubTypeMapper mapper,
                                 InquiryTypeRepository inquiryTypeRepository, InquiryTypeMapper inquiryTypeMapper) {
        this.inquirySubTypeRepository = inquirySubTypeRepository;
        this.mapper = mapper;
        this.inquiryTypeRepository = inquiryTypeRepository;
        this.inquiryTypeMapper = inquiryTypeMapper;
    }

    /**
     * Adds a new Inquiry Sub Type.
     *
     * @param inquirySubTypeDTO the DTO containing the details of the inquiry sub type
     * @return the ID of the newly created inquiry sub type
     * @throws CustomException if a duplicate name or invalid inquiry type is found
     */
    public Long addInquirySubType(@Valid InquirySubTypeDTO inquirySubTypeDTO) {
        inquirySubTypeRepository.findByNameIgnoreCase(inquirySubTypeDTO.getName())
            .ifPresent(existing -> {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.DUPLICATE_INQUIRY_SUB_TYPE,
                    new String[]{inquirySubTypeDTO.getName()}, null);
            });

        inquiryTypeRepository.findByIdAndStatusTrue(inquirySubTypeDTO.getInquiryTypeId())
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.INQUIRY_TYPE_NOT_FOUND,
                new String[]{inquirySubTypeDTO.getInquiryTypeId().toString()}, null));

        InquirySubTypeEntity entity = mapper.toEntity(inquirySubTypeDTO);
        entity.setStatus(true); // Set status to active by default
        InquirySubTypeEntity saved = inquirySubTypeRepository.save(entity);
        return saved.getId();
    }

    /**
     * Updates an existing Inquiry Sub Type.
     *
     * @param id  the ID of the inquiry sub type to update
     * @param dto the DTO containing updated information
     * @throws CustomException if a duplicate name or invalid inquiry type is found
     */
    public void updateInquirySubType(Long id, InquirySubTypeDTO dto) {
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

        inquiryTypeRepository.findByIdAndStatusTrue(dto.getInquiryTypeId())
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.INQUIRY_TYPE_NOT_FOUND,
                new String[]{dto.getInquiryTypeId().toString()}, null));

        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        inquirySubTypeRepository.save(entity);
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
     * @param id     the ID of the inquiry sub type to update
     * @param status the new status to be set
     * @throws CustomException if the inquiry sub type is not found
     */
    @Transactional
    public void changeStatus(Long id, Boolean status) {
        InquirySubTypeEntity entity = inquirySubTypeRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.INQUIRY_SUB_TYPE_NOT_FOUND,
                new String[]{id.toString()}, null));

        entity.setStatus(status);
        inquirySubTypeRepository.save(entity);
    }

    /**
     * Retrieves an Inquiry Sub Type by its ID.
     *
     * @param id the ID of the inquiry sub type
     * @return the DTO representing the inquiry sub type
     * @throws CustomException if the inquiry sub type is not found
     */
    @Transactional(readOnly = true)
    public InquirySubTypeDTO getInquirySubTypeById(Long id) {
        return inquirySubTypeRepository.findById(id)
            .map(mapper::toDTO)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.INQUIRY_SUB_TYPE_NOT_FOUND,
                new String[]{id.toString()}, null));
    }

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
