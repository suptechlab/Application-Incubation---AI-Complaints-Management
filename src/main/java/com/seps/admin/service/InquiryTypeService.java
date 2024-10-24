package com.seps.admin.service;

import com.seps.admin.domain.InquiryTypeEntity;
import com.seps.admin.repository.InquiryTypeRepository;
import com.seps.admin.service.dto.InquiryTypeDTO;
import com.seps.admin.service.mapper.InquiryTypeMapper;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.zalando.problem.Status;

import java.util.Locale;

/**
 * Service class for managing Inquiry Types.
 */
@Service
@Transactional
public class InquiryTypeService {

    private final InquiryTypeRepository inquiryTypeRepository;
    private final InquiryTypeMapper inquiryTypeMapper;

    /**
     * Constructor to initialize the service with necessary repositories and mappers.
     *
     * @param inquiryTypeRepository the repository for InquiryTypeEntity
     * @param inquiryTypeMapper the mapper for converting between DTO and entity
     */
    @Autowired
    public InquiryTypeService(InquiryTypeRepository inquiryTypeRepository, InquiryTypeMapper inquiryTypeMapper) {
        this.inquiryTypeRepository = inquiryTypeRepository;
        this.inquiryTypeMapper = inquiryTypeMapper;
    }

    /**
     * Adds a new Inquiry Type.
     *
     * @param inquiryTypeDTO the Inquiry Type data transfer object
     * @param locale the locale for messages and localization
     * @return the ID of the newly created Inquiry Type
     * @throws CustomException if a duplicate Inquiry Type name exists
     */
    public Long addInquiryType(@Valid InquiryTypeDTO inquiryTypeDTO, Locale locale) {
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
        return savedInquiryType.getId();
    }

    /**
     * Updates an existing Inquiry Type.
     *
     * @param id the ID of the Inquiry Type to update
     * @param inquiryTypeDTO the updated Inquiry Type data transfer object
     * @throws CustomException if the Inquiry Type is not found or if there is a duplicate name
     */
    public void updateInquiryType(Long id, InquiryTypeDTO inquiryTypeDTO) {
        InquiryTypeEntity existingInquiryType = inquiryTypeRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.INQUIRY_TYPE_NOT_FOUND, new String[]{ id.toString() }, null));

        inquiryTypeRepository.findByNameIgnoreCase(inquiryTypeDTO.getName())
            .ifPresent(duplicateInquiryType -> {
                if (!duplicateInquiryType.getId().equals(existingInquiryType.getId())) {
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.DUPLICATE_INQUIRY_TYPE, new String[]{ inquiryTypeDTO.getName() }, null);
                }
            });

        existingInquiryType.setName(inquiryTypeDTO.getName());
        existingInquiryType.setDescription(inquiryTypeDTO.getDescription());

        InquiryTypeEntity updatedInquiryType = inquiryTypeRepository.save(existingInquiryType);
        inquiryTypeMapper.toDTO(updatedInquiryType);
    }

    /**
     * Retrieves an Inquiry Type by its ID.
     *
     * @param id the ID of the Inquiry Type
     * @return the Inquiry Type DTO
     * @throws CustomException if the Inquiry Type is not found
     */
    @Transactional(readOnly = true)
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
    public Page<InquiryTypeDTO> getAllInquiryTypes(Pageable pageable, String search) {
        if (StringUtils.hasText(search)) {
            return inquiryTypeRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(search, search, pageable)
                .map(inquiryTypeMapper::toDTO);
        } else {
            return inquiryTypeRepository.findAll(pageable)
                .map(inquiryTypeMapper::toDTO);
        }
    }

    /**
     * Changes the status of an Inquiry Type (e.g., active or inactive).
     *
     * @param inquiryTypeId the ID of the Inquiry Type
     * @param status the new status (true for active, false for inactive)
     * @throws CustomException if the Inquiry Type is not found
     */
    @Transactional
    public void changeStatus(Long inquiryTypeId, Boolean status) {
        InquiryTypeEntity inquiryType = inquiryTypeRepository.findById(inquiryTypeId)
            .orElseThrow(() -> new CustomException(
                Status.NOT_FOUND,
                SepsStatusCode.INQUIRY_TYPE_NOT_FOUND,
                new String[]{ inquiryTypeId.toString() },
                null
            ));

        inquiryType.setStatus(status);
        inquiryTypeRepository.save(inquiryType);
    }
}
