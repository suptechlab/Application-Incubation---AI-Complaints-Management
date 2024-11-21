package com.seps.user.service;

import com.seps.user.repository.CityRepository;
import com.seps.user.service.dto.DropdownListDTO;
import com.seps.user.service.mapper.CityMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


/**
 * Service class for managing City entities.
 */
@Service
@Transactional
public class CityService {

    private final CityRepository cityRepository;
    private final CityMapper cityMapper;
    /**
     * Constructor to inject required dependencies.
     *
     * @param cityRepository the repository for CityEntity
     * @param cityMapper the mapper for converting between CityEntity and CityDTO
     */
    public CityService(CityRepository cityRepository, CityMapper cityMapper) {
        this.cityRepository = cityRepository;
        this.cityMapper = cityMapper;
    }


    public List<DropdownListDTO> listActiveCityByProvinceId(Long provinceId) {
        return cityRepository.findAllByStatusAndProvinceId(true, provinceId)
            .stream()
            .map(cityMapper::toDropDownDTO)
            .toList();
    }
}
