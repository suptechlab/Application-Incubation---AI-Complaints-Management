package com.seps.admin.repository;

import com.seps.admin.domain.ProvinceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProvinceRepository extends JpaRepository<ProvinceEntity, Long>, JpaSpecificationExecutor<ProvinceEntity> {

    Optional<ProvinceEntity> findByNameIgnoreCase(String name);

    List<ProvinceEntity> findAllByStatus(boolean status);
}

