package com.seps.user.repository;

import com.seps.user.domain.CityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface CityRepository extends JpaRepository<CityEntity, Long>, JpaSpecificationExecutor<CityEntity> {

    List<CityEntity> findAllByStatusAndProvinceId(Boolean status, Long provinceId);
}

