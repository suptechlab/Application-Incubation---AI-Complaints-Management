package com.seps.user.service;

import com.seps.user.repository.OrganizationRepository;
import com.seps.user.service.dto.DropdownListDTO;
import com.seps.user.service.dto.OrganizationDTO;
import com.seps.user.service.mapper.OrganizationMapper;
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


    public List<OrganizationDTO> fetchOrganizationList() {
        return organizationRepository.findAll().stream()
            .map(organizationMapper::toDTO).toList();
    }
}
