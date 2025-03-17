package com.seps.user.repository;

import com.seps.user.domain.ClaimTypeEntity;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimTypeRepository extends JpaRepository<ClaimTypeEntity, Long>, JpaSpecificationExecutor<ClaimTypeEntity> {
    List<ClaimTypeEntity> findAllByStatus(boolean status, Sort sort);
}

