package com.seps.admin.repository;

import com.seps.admin.domain.CityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CityRepository extends JpaRepository<CityEntity, Long>, JpaSpecificationExecutor<CityEntity> {

    Optional<CityEntity> findByNameIgnoreCase(String name);

    List<CityEntity> findAllByStatusAndProvinceId(Boolean status, Long provinceId);
}

