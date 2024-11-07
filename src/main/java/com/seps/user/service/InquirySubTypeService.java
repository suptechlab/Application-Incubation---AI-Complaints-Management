package com.seps.user.service;

import com.google.gson.Gson;
import com.seps.user.repository.InquirySubTypeRepository;
import com.seps.user.repository.InquiryTypeRepository;
import com.seps.user.service.dto.InquirySubTypeDTO;
import com.seps.user.service.mapper.InquirySubTypeMapper;
import com.seps.user.service.specification.InquirySubTypeSpecification;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

}
