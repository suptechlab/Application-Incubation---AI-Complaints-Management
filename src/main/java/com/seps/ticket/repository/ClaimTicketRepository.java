package com.seps.ticket.repository;

import com.seps.ticket.domain.ClaimTicket;
import io.github.resilience4j.core.functions.Either;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimTicketRepository extends JpaRepository<ClaimTicket, Long> {

    List<ClaimTicket> findByUserIdAndClaimTypeIdAndClaimSubTypeIdAndOrganizationId(Long currentUserId, Long claimTypeId,
                                                                                   Long claimSubTypeId, Long organizationId);

    Optional<ClaimTicket> findByIdAndUserId(Long id, Long userId);
}
