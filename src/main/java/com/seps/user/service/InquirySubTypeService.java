package com.seps.user.service;

import com.seps.user.repository.InquirySubTypeRepository;
import com.seps.user.service.dto.DropdownListDTO;
import com.seps.user.service.mapper.InquirySubTypeMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class for managing Inquiry Sub Types, providing functionalities to add, update, retrieve,
 * change status, and download Inquiry Sub Type data.
 */
@Service
@Transactional
public class InquirySubTypeService {

    private final InquirySubTypeRepository inquirySubTypeRepository;
    private final InquirySubTypeMapper mapper;
    /**
     * Constructor to inject required repositories and mappers.
     *
     * @param inquirySubTypeRepository the inquiry subtype repository
     * @param mapper the inquiry subtype mapper
     */
    public InquirySubTypeService(InquirySubTypeRepository inquirySubTypeRepository, InquirySubTypeMapper mapper) {
        this.inquirySubTypeRepository = inquirySubTypeRepository;
        this.mapper = mapper;
    }


    /**
     * Retrieves a list of active inquiry subtypes based on the provided inquiry type ID.
     *
     * <p>This method queries the repository for all inquiry subtypes that are active (status = true)
     * and belong to the specified inquiry type ID. The results are then mapped to a list of
     * {@link DropdownListDTO} for use in dropdown selections or lists.
     *
     * @param inquiryType The ID of the inquiry type for which to fetch active subtypes.
     * @return A list of {@link DropdownListDTO} containing active subtypes for the specified inquiry type.
     *         If no active subtypes are found, an empty list is returned.
     */
    @Transactional(readOnly = true)
    public List<DropdownListDTO> listActiveSubInquiryTypesById(Long inquiryType) {
        return inquirySubTypeRepository.findAllByStatusAndInquiryTypeId(true, inquiryType)
            .stream()
            .map(mapper::toDropDownDTO)
            .toList();
    }
}
