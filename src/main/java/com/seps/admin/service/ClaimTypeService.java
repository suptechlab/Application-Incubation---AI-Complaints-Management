package com.seps.admin.service;

import com.seps.admin.domain.ClaimTypeEntity;
import com.seps.admin.repository.ClaimTypeRepository;
import com.seps.admin.service.dto.ClaimTypeDTO;
import com.seps.admin.service.mapper.ClaimTypeMapper;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

import java.util.List;

@Service
@Transactional
public class ClaimTypeService {

    private final ClaimTypeRepository claimTypeRepository;
    private final ClaimTypeMapper claimTypeMapper;

    public ClaimTypeService(ClaimTypeRepository claimTypeRepository, ClaimTypeMapper claimTypeMapper) {
        this.claimTypeRepository = claimTypeRepository;
        this.claimTypeMapper = claimTypeMapper;
    }

    public Long addClaimType(ClaimTypeDTO claimTypeDTO) {
        claimTypeRepository.findByNameIgnoreCase(claimTypeDTO.getName())
            .ifPresent(existingInquiryType -> {
                    throw new CustomException(
                        Status.BAD_REQUEST,
                        SepsStatusCode.DUPLICATE_CLAIM_TYPE,
                        new String[]{ claimTypeDTO.getName() },
                        null
                    );
                }
            );
        ClaimTypeEntity entity = claimTypeMapper.toEntity(claimTypeDTO);
        entity.setStatus(true);  // Default to active
        return claimTypeRepository.save(entity).getId();
    }

    public void updateClaimType(Long id, ClaimTypeDTO claimTypeDTO) {
        ClaimTypeEntity entity = claimTypeRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TYPE_NOT_FOUND, new String[]{ id.toString() }, null));

        claimTypeRepository.findByNameIgnoreCase(claimTypeDTO.getName())
            .ifPresent(duplicateInquiryType -> {
                if (!duplicateInquiryType.getId().equals(entity.getId())) {
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.DUPLICATE_CLAIM_TYPE, new String[]{ claimTypeDTO.getName() }, null);
                }
            });
        entity.setName(claimTypeDTO.getName());
        entity.setDescription(claimTypeDTO.getDescription());
        entity.setStatus(claimTypeDTO.getStatus());
        claimTypeRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public ClaimTypeDTO getClaimTypeById(Long id) {
        return claimTypeRepository.findById(id)
            .map(claimTypeMapper::toDTO)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TYPE_NOT_FOUND, new String[]{ id.toString() }, null));
    }

    @Transactional(readOnly = true)
    public Page<ClaimTypeDTO> listClaimTypes(Pageable pageable, String search, Boolean status) {
        // Add search and status filtering logic here if needed
        return claimTypeRepository.findAll(pageable)
            .map(claimTypeMapper::toDTO);
    }

    public void changeStatus(Long id, Boolean status) {
        ClaimTypeEntity entity = claimTypeRepository.findById(id)
            .orElseThrow(() -> new CustomException(
                Status.NOT_FOUND,
                SepsStatusCode.INQUIRY_TYPE_NOT_FOUND,
                new String[]{ id.toString() },
                null
            ));
        entity.setStatus(status);
        claimTypeRepository.save(entity);
    }
}
