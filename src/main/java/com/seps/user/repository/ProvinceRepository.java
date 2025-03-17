package com.seps.user.repository;

import com.seps.user.domain.ProvinceEntity;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProvinceRepository extends JpaRepository<ProvinceEntity, Long>, JpaSpecificationExecutor<ProvinceEntity> {

    List<ProvinceEntity> findAllByStatus(boolean status, Sort sort);
}

