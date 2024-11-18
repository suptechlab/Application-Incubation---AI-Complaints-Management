package com.seps.user.service;

import com.seps.user.repository.InquiryTypeRepository;
import com.seps.user.service.dto.DropdownListDTO;
import com.seps.user.service.mapper.InquiryTypeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;


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

    /**
     * Constructor to initialize the service with required dependencies.
     *
     * @param inquiryTypeRepository the repository for InquiryTypeEntity operations
     * @param inquiryTypeMapper the mapper for converting between InquiryTypeDTO and InquiryTypeEntity
     */
    @Autowired
    public InquiryTypeService(InquiryTypeRepository inquiryTypeRepository, InquiryTypeMapper inquiryTypeMapper) {
        this.inquiryTypeRepository = inquiryTypeRepository;
        this.inquiryTypeMapper = inquiryTypeMapper;
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
