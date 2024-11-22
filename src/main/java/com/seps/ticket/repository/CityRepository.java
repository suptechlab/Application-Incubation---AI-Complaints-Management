package com.seps.ticket.repository;

import com.seps.ticket.domain.City;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CityRepository extends JpaRepository<City, Long> {

    Optional<City> findByIdAndProvinceId(Long Id, Long provinceId);
}
