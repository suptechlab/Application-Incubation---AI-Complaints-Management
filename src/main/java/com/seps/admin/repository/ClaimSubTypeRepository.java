package com.seps.admin.repository;

import com.seps.admin.domain.ClaimSubTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimSubTypeRepository extends JpaRepository<ClaimSubTypeEntity, Long>, JpaSpecificationExecutor<ClaimSubTypeEntity> {

    Optional<ClaimSubTypeEntity> findByNameIgnoreCase(String name);

    List<ClaimSubTypeEntity> findAllByStatusAndClaimTypeId(boolean status, Long claimTypeId);
}

