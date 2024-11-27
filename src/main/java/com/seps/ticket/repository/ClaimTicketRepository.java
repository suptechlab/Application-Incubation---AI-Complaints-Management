package com.seps.ticket.repository;

import com.seps.ticket.domain.ClaimTicket;
import com.seps.ticket.service.projection.ClaimStatusCountProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimTicketRepository extends JpaRepository<ClaimTicket, Long> {

    List<ClaimTicket> findByUserIdAndClaimTypeIdAndClaimSubTypeIdAndOrganizationId(Long currentUserId, Long claimTypeId,
                                                                                   Long claimSubTypeId, Long organizationId);

    Optional<ClaimTicket> findByIdAndUserId(Long id, Long userId);

    boolean existsByTicketId(long ticketId);

    Page<ClaimTicket> findAll(Specification<ClaimTicket> claimTicketSpecification, Pageable pageable);

    @Query("SELECT new com.seps.ticket.service.projection.ClaimStatusCountProjection(ct.status, COUNT(ct)) " +
        "FROM ClaimTicket ct " +
        "WHERE (:year IS NULL OR EXTRACT(YEAR FROM ct.createdAt) = :year) " +
        "AND (:userId IS NULL OR ct.userId = :userId) " +
        "GROUP BY ct.status")
    List<ClaimStatusCountProjection> countClaimsByStatusAndTotal(@Param("year") Integer year, @Param("userId") Long userId);


    Optional<ClaimTicket> findByIdAndOrganizationId(Long id, Long organizationId);
}
