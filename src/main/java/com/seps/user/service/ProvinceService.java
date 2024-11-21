package com.seps.user.service;

import com.seps.user.repository.ProvinceRepository;
import com.seps.user.service.dto.DropdownListDTO;
import com.seps.user.service.mapper.ProvinceMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;


/**
 * Service class for managing Province entities.
 */
@Service
@Transactional
public class ProvinceService {

    private final ProvinceRepository provinceRepository;
    private final ProvinceMapper provinceMapper;

    /**
     * Constructor to inject required dependencies.
     *
     * @param provinceRepository the repository for ProvinceEntity
     * @param provinceMapper the mapper for converting between ProvinceEntity and ProvinceDTO
     */
    public ProvinceService(ProvinceRepository provinceRepository, ProvinceMapper provinceMapper) {
        this.provinceRepository = provinceRepository;
        this.provinceMapper = provinceMapper;
    }
    /**
     * Retrieves a list of active Provinces for dropdown selection.
     *
     * @return a list of DropdownListDTO containing active provinces
     */
    public List<DropdownListDTO> listActiveProvince() {
        return provinceRepository.findAllByStatus(true)
            .stream()
            .map(provinceMapper::toDropDownDTO)
            .toList();
    }
}
