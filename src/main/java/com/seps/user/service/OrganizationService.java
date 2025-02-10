package com.seps.user.service;

import com.seps.user.domain.Organization;
import com.seps.user.repository.OrganizationRepository;
import com.seps.user.service.dto.OrganizationDTO;
import com.seps.user.service.mapper.OrganizationMapper;
import com.seps.user.service.specification.OrganizationSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;


import java.util.*;


@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMapper organizationMapper;

    public OrganizationService(OrganizationRepository organizationRepository, OrganizationMapper organizationMapper) {
        this.organizationRepository = organizationRepository;
        this.organizationMapper = organizationMapper;
    }


    public Page<OrganizationDTO> fetchOrganizationList(String search, Pageable pageable) {
        Specification<Organization> spec = OrganizationSpecification.hasSearchTerm(search);
        return organizationRepository.findAll(spec, pageable)
            .map(organizationMapper::toDTO);
    }

    public List<OrganizationDTO> fetchOrganizationList() {
        return organizationRepository.findAll().stream()
            .map(organizationMapper::toDTO).toList();
    }
}
