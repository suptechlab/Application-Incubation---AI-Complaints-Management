package com.seps.admin.repository;

import com.seps.admin.domain.ClaimTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClaimTypeRepository extends JpaRepository<ClaimTypeEntity, Long>, JpaSpecificationExecutor<ClaimTypeEntity> {
    Optional<ClaimTypeEntity> findByNameIgnoreCase(String name);

}

