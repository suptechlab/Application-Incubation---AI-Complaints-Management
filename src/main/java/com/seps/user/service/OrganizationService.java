package com.seps.user.service;

import com.seps.user.repository.OrganizationRepository;
import com.seps.user.service.dto.DropdownListDTO;
import org.springframework.stereotype.Service;

import java.util.*;


@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    public OrganizationService(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    /**
     * Fetches a list of organizations and maps them to a list of {@link DropdownListDTO}.
     *
     * <p>This method retrieves all organizations from the database, formats their details
     * (combining the organization's nemonico type and RUC in a specific format), and
     * converts them into {@link DropdownListDTO} objects to be used in dropdown menus or
     * similar UI components.</p>
     *
     * @return a list of {@link DropdownListDTO} containing the organization's ID and
     *         formatted name in the format: "nemonicoTipoOrganizacion (RUC)".
     */
    public List<DropdownListDTO> fetchOrganizationList() {
        return organizationRepository.findAll().stream()
            .map(org->{
                DropdownListDTO orgDto = new DropdownListDTO();
                orgDto.setId(org.getId());
                orgDto.setName(org.getNemonicoTipoOrganizacion() + " (" + org.getRuc() + ")" );
                return orgDto;
            })
            .toList();
    }
}
