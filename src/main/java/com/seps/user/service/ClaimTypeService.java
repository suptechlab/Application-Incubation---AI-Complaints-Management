package com.seps.user.service;

import com.seps.user.repository.ClaimTypeRepository;
import com.seps.user.service.dto.DropdownListDTO;
import com.seps.user.service.mapper.ClaimTypeMapper;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

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
     * Retrieves a list of active Claim Types for dropdown purposes.
     *
     * @return a list of DropdownListDTOs representing active claim types
     */
    @Transactional(readOnly = true)
    public List<DropdownListDTO> listActiveClaimTypes() {
        return claimTypeRepository.findAllByStatus(true, Sort.by(Sort.Direction.ASC, "name"))
            .stream()
            .map(claimTypeMapper::toDropDownDTO)
            .toList();
    }
}
