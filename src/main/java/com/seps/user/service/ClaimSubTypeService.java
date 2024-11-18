package com.seps.user.service;

import com.seps.user.repository.ClaimSubTypeRepository;
import com.seps.user.service.dto.DropdownListDTO;
import com.seps.user.service.mapper.ClaimSubTypeMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;


/**
 * Service class for managing Claim Sub Types.
 */
@Service
@Transactional
public class ClaimSubTypeService {

    private final ClaimSubTypeRepository claimSubTypeRepository;
    private final ClaimSubTypeMapper claimSubTypeMapper;
    /**
     * Constructor to inject required dependencies.
     *
     * @param claimSubTypeRepository the repository for ClaimSubTypeEntity
     * @param claimSubTypeMapper the mapper for converting between ClaimSubTypeEntity and ClaimSubTypeDTO
     */
    public ClaimSubTypeService(ClaimSubTypeRepository claimSubTypeRepository, ClaimSubTypeMapper claimSubTypeMapper) {
        this.claimSubTypeRepository = claimSubTypeRepository;
        this.claimSubTypeMapper = claimSubTypeMapper;
    }

    /**
     * Retrieves a list of active claim subtypes based on the provided claim type ID.
     *
     * <p>This method fetches all claim subtypes that are marked as active (status = true)
     * and belong to the specified claim type ID. The result is then mapped to a list of
     * {@link DropdownListDTO} for use in dropdown selections or lists.
     *
     * @param claimType The ID of the claim type for which to retrieve active subtypes.
     * @return A list of {@link DropdownListDTO} containing active claim subtypes for the specified claim type.
     *         If no active subtypes are found, an empty list is returned.
     */
    @Transactional(readOnly = true)
    public List<DropdownListDTO> listActiveClaimSubTypesById(Long claimType) {
        return claimSubTypeRepository.findAllByStatusAndClaimTypeId(true, claimType)
            .stream()
            .map(claimSubTypeMapper::toDropDownDTO)
            .toList();
    }
}
