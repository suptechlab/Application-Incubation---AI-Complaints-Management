package com.seps.ticket.repository;

import com.seps.ticket.domain.ClaimSubType;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClaimSubTypeRepository extends JpaRepository<ClaimSubType, Long> {

    Optional<ClaimSubType> findByIdAndClaimTypeId(Long id, Long claimTypeId);

}
