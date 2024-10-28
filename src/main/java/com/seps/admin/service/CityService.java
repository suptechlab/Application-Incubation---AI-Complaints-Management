package com.seps.admin.service;

import com.seps.admin.domain.CityEntity;
import com.seps.admin.domain.ProvinceEntity;
import com.seps.admin.repository.CityRepository;
import com.seps.admin.repository.ProvinceRepository;
import com.seps.admin.service.dto.CityDTO;
import com.seps.admin.service.mapper.CityMapper;
import com.seps.admin.service.specification.CitySpecification;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

/**
 * Service class for managing City entities.
 */
@Service
@Transactional
public class CityService {

    private final CityRepository cityRepository;
    private final CityMapper cityMapper;
    private final ProvinceRepository provinceRepository;

    /**
     * Constructor to inject required dependencies.
     *
     * @param cityRepository the repository for CityEntity
     * @param cityMapper the mapper for converting between CityEntity and CityDTO
     * @param provinceRepository the repository for ProvinceEntity
     */
    public CityService(CityRepository cityRepository, CityMapper cityMapper, ProvinceRepository provinceRepository) {
        this.cityRepository = cityRepository;
        this.cityMapper = cityMapper;
        this.provinceRepository = provinceRepository;
    }

    /**
     * Adds a new City.
     *
     * @param cityDTO the DTO containing the details of the city
     * @return the ID of the newly created city
     * @throws CustomException if a city with the same name already exists or if the province is not found
     */
    public Long addCity(CityDTO cityDTO) {
        cityRepository.findByNameIgnoreCase(cityDTO.getName())
            .ifPresent(existingCity -> {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.DUPLICATE_CITY,
                    new String[]{cityDTO.getName()}, null);
            });

        ProvinceEntity provinceEntity = provinceRepository.findById(cityDTO.getProvinceId())
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.PROVINCE_NOT_FOUND,
                new String[]{cityDTO.getProvinceId().toString()}, null));

        cityDTO.setProvinceId(provinceEntity.getId());
        CityEntity entity = cityMapper.toEntity(cityDTO);
        entity.setStatus(true);  // Default to active
        return cityRepository.save(entity).getId();
    }

    /**
     * Updates an existing City.
     *
     * @param id the ID of the city to update
     * @param cityDTO the DTO containing the updated details
     * @throws CustomException if the city or province is not found or if a duplicate city name is detected
     */
    public void updateCity(Long id, CityDTO cityDTO) {
        CityEntity entity = cityRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CITY_NOT_FOUND,
                new String[]{id.toString()}, null));

        cityRepository.findByNameIgnoreCase(cityDTO.getName())
            .ifPresent(duplicateCity -> {
                if (!duplicateCity.getId().equals(entity.getId())) {
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.DUPLICATE_CITY,
                        new String[]{cityDTO.getName()}, null);
                }
            });

        provinceRepository.findById(cityDTO.getProvinceId())
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.PROVINCE_NOT_FOUND,
                new String[]{cityDTO.getProvinceId().toString()}, null));

        entity.setName(cityDTO.getName());
        cityRepository.save(entity);
    }

    /**
     * Retrieves a City by its ID.
     *
     * @param id the ID of the city to retrieve
     * @return the DTO representing the city
     * @throws CustomException if the city is not found
     */
    @Transactional(readOnly = true)
    public CityDTO getCityById(Long id) {
        return cityRepository.findById(id)
            .map(cityMapper::toDTO)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CITY_NOT_FOUND,
                new String[]{id.toString()}, null));
    }

    /**
     * Retrieves a paginated list of Cities, filtered by search term and status.
     *
     * @param pageable the pagination information
     * @param search the search term to filter cities by name (optional)
     * @param status the status filter (true for active, false for inactive) (optional)
     * @return a paginated list of CityDTOs
     */
    @Transactional(readOnly = true)
    public Page<CityDTO> listCities(Pageable pageable, String search, Boolean status) {
        return cityRepository.findAll(CitySpecification.byFilter(search, status), pageable)
            .map(cityMapper::toDTO);
    }

    /**
     * Changes the status of a City (active/inactive).
     *
     * @param id the ID of the city to change status for
     * @param status the new status (true for active, false for inactive)
     * @throws CustomException if the city is not found
     */
    public void changeStatus(Long id, Boolean status) {
        CityEntity entity = cityRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CITY_NOT_FOUND,
                new String[]{id.toString()}, null));
        entity.setStatus(status);
        cityRepository.save(entity);
    }
}
