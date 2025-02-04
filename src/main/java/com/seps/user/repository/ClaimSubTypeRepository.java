package com.seps.user.repository;

import com.seps.user.domain.ClaimSubTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimSubTypeRepository extends JpaRepository<ClaimSubTypeEntity, Long>, JpaSpecificationExecutor<ClaimSubTypeEntity> {

    List<ClaimSubTypeEntity> findAllByStatusAndClaimTypeId(boolean status, Long claimTypeId);
}

