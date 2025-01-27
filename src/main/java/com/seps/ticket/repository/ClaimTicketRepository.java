package com.seps.ticket.repository;

import com.seps.ticket.domain.ClaimTicket;
import com.seps.ticket.enums.*;
import com.seps.ticket.service.projection.ClaimStatusCountProjection;
import com.seps.ticket.service.projection.CloseClaimStatusCountProjection;
import com.seps.ticket.service.projection.SlaAdherenceDataProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
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

    List<ClaimTicket> findAllByIdInAndOrganizationId(List<Long> ids, Long organizationId);

    Optional<ClaimTicket> findByTicketId(Long ticketId);

    @Query("SELECT new com.seps.ticket.service.projection.ClaimStatusCountProjection(ct.status, COUNT(ct)) " +
        "FROM ClaimTicket ct " +
        "WHERE (:userId IS NULL OR ct.sepsAgentId = :userId) " +
        "GROUP BY ct.status")
    List<ClaimStatusCountProjection> countClaimsByStatusAndTotalSEPS(@Param("userId") Long userId);

    @Query("SELECT new com.seps.ticket.service.projection.ClaimStatusCountProjection(ct.status, COUNT(ct)) " +
        "FROM ClaimTicket ct " +
        "WHERE organizationId = :organizationId " +
        "AND (:userId IS NULL OR ct.fiAgentId = :userId) " +
        "GROUP BY ct.status")
    List<ClaimStatusCountProjection> countClaimsByStatusAndTotalFiAgentAndOrganizationId(@Param("userId") Long userId,
                                                                                         @Param("organizationId") Long organizationId);

    Optional<ClaimTicket> findByIdAndUserIdAndInstanceType(Long claimTicketId, Long currentUserId, InstanceTypeEnum instanceTypeEnum);

    @Query("SELECT c FROM ClaimTicket c JOIN FETCH c.user u JOIN FETCH u.roles WHERE c.status NOT IN :excludedStatuses AND c.slaBreachDate IS NOT NULL")
    List<ClaimTicket> findEligibleTickets(@Param("excludedStatuses") List<ClaimTicketStatusEnum> excludedStatuses);

    List<ClaimTicket> findAllByStatusNotInAndSlaBreachDateIsNotNull(List<ClaimTicketStatusEnum> excludedStatuses);


    @Query("SELECT c FROM ClaimTicket c WHERE c.user.id = :userId " +
        "AND c.instanceType = :instanceType " +
        "AND c.canCreateInstance = true " +
        "AND (c.status = :closedStatus " +
        "OR c.status = :rejectedStatus) ")
    List<ClaimTicket> findValidClaimTickets(@Param("userId") Long userId,
                                            @Param("instanceType") InstanceTypeEnum instanceType,
                                            @Param("closedStatus") ClaimTicketStatusEnum closedStatus,
                                            @Param("rejectedStatus") ClaimTicketStatusEnum rejectedStatus
    );


    @Query("SELECT new com.seps.ticket.service.projection.ClaimStatusCountProjection(ct.status, COUNT(ct)) " +
        "FROM ClaimTicket ct " +
        "WHERE (COALESCE(:userId, NULL) IS NULL OR " +
        "(ct.sepsAgentId = :userId AND :isSeps = true) OR " +
        "(ct.fiAgentId = :userId AND :isSeps = false)) " +
        "AND (COALESCE(:organizationId, NULL) IS NULL OR ct.organizationId = :organizationId) " +
        "AND (COALESCE(:startDate, NULL) IS NULL OR ct.createdAt >= :startDate) " +
        "AND (COALESCE(:endDate, NULL) IS NULL OR ct.createdAt <= :endDate) " +
        "GROUP BY ct.status")
    List<ClaimStatusCountProjection> countClaimsByFilters(@Param("userId") Long userId,
                                                          @Param("organizationId") Long organizationId,
                                                          @Param("startDate") Instant startDate,
                                                          @Param("endDate") Instant endDate,
                                                          @Param("isSeps") boolean isSeps);

    @Query("SELECT new com.seps.ticket.service.projection.CloseClaimStatusCountProjection(ct.closedStatus, COUNT(ct)) " +
        "FROM ClaimTicket ct " +
        "WHERE (COALESCE(:userId, NULL) IS NULL OR " +
        "(ct.sepsAgentId = :userId AND :isSeps = true) OR " +
        "(ct.fiAgentId = :userId AND :isSeps = false)) " +
        "AND (COALESCE(:organizationId, NULL) IS NULL OR ct.organizationId = :organizationId) " +
        "AND (COALESCE(:startDate, NULL) IS NULL OR ct.createdAt >= :startDate) " +
        "AND (COALESCE(:endDate, NULL) IS NULL OR ct.createdAt <= :endDate) " +
        "AND ct.status = :closeStatus " +
        "GROUP BY ct.closedStatus")
    List<CloseClaimStatusCountProjection> countClosedClaimsByFilters(@Param("userId") Long userId,
                                                                     @Param("organizationId") Long organizationId,
                                                                     @Param("startDate") Instant startDate,
                                                                     @Param("endDate") Instant endDate,
                                                                     @Param("isSeps") boolean isSeps,
                                                                     @Param("closeStatus") ClaimTicketStatusEnum closeStatus);


    @Query("SELECT new com.seps.ticket.service.projection.SlaAdherenceDataProjection( " +
        "SUM(CASE WHEN ct.resolvedOn IS NOT NULL AND ct.slaBreachDate >= ct.resolvedOn THEN 1 ELSE 0 END), " +
        "SUM(CASE WHEN ct.resolvedOn IS NULL THEN 1 ELSE 0 END)) " +
        "FROM ClaimTicket ct " +
        "WHERE (COALESCE(:userId, NULL) IS NULL OR " +
        "   (ct.sepsAgentId = :userId AND :isSeps = true) OR " +
        "   (ct.fiAgentId = :userId AND :isSeps = false)) " +
        "  AND (COALESCE(:organizationId, NULL) IS NULL OR ct.organizationId = :organizationId) " +
        "  AND (COALESCE(:startDate, NULL) IS NULL OR ct.createdAt >= :startDate) " +
        "  AND (COALESCE(:endDate, NULL) IS NULL OR ct.createdAt <= :endDate) " +
        "  AND ct.instanceType IN :instanceType " +
        "  AND ct.status = :status")
    SlaAdherenceDataProjection getClaimSlaAdherence(
        @Param("userId") Long userId,
        @Param("organizationId") Long organizationId,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate,
        @Param("isSeps") boolean isSeps,
        @Param("status") ClaimTicketStatusEnum status,
        @Param("instanceType") List<InstanceTypeEnum> instanceType);


    @Query(value = "SELECT ROUND(AVG(EXTRACT(EPOCH FROM ct.resolved_on - ct.created_at " +
//        "COALESCE(" +
//        "   CASE " +
//        "       WHEN ct.instance_type = 1 THEN ct.second_instance_filed_at " +
//        "       WHEN ct.instance_type = 2 THEN ct.complaint_filed_at " +
//        "       ELSE ct.created_at " +
//        "   END, ct.created_at" +
        ") / 86400), 2) AS avg_resolution_time " +
        "FROM claim_ticket ct " +
        "WHERE (:userId IS NULL OR " +
        "      (:isSeps = true AND ct.seps_agent_id = :userId) OR " +
        "      (:isSeps = false AND ct.fi_agent_id = :userId)) " +
        "  AND (COALESCE(:organizationId, NULL) IS NULL OR ct.organization_id = :organizationId) " +
        "  AND (COALESCE(:startDate, NULL) IS NULL OR ct.created_at >= :startDate) " +
        "  AND (COALESCE(:endDate, NULL) IS NULL OR ct.created_at <= :endDate) " +
//        "  AND (COALESCE(:startDate, NULL) IS NULL OR " +
//        "       COALESCE(" +
//        "           CASE " +
//        "               WHEN ct.instance_type = 1 THEN ct.second_instance_filed_at " +
//        "               WHEN ct.instance_type = 2 THEN ct.complaint_filed_at " +
//        "               ELSE ct.created_at " +
//        "           END, ct.created_at) >= :startDate) " +
//        "  AND (COALESCE(:endDate, NULL) IS NULL OR " +
//        "       COALESCE(" +
//        "           CASE " +
//        "               WHEN ct.instance_type = 1 THEN ct.second_instance_filed_at " +
//        "               WHEN ct.instance_type = 2 THEN ct.complaint_filed_at " +
//        "               ELSE ct.created_at " +
//        "           END, ct.created_at) <= :endDate) " +
        "  AND ct.resolved_on IS NOT NULL " +
        "  AND ct.status = :status",
        nativeQuery = true)
    Double getAvgResolutionTime(
        @Param("userId") Long userId,
        @Param("organizationId") Long organizationId,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate,
        @Param("isSeps") boolean isSeps,
        @Param("status") ClaimTicketStatusEnum status);

    List<ClaimTicket> findAll(Specification<ClaimTicket> claimTicketSpecification);

    @Query("SELECT c FROM ClaimTicket c WHERE c.slaBreachDate IS NOT NULL " +
        "AND c.status NOT IN (:closed, :rejected) " +
        "AND c.slaPopup IS NULL")
    List<ClaimTicket> findEligibleTicketsForSlaPopup(@Param("closed") ClaimTicketStatusEnum closed,
                                                     @Param("rejected") ClaimTicketStatusEnum rejected);

    Optional<ClaimTicket> findByInstanceTypeAndPreviousTicketId(InstanceTypeEnum instanceTypeEnum, Long previousTicketId);

    Optional<ClaimTicket> findByIdAndOrganizationIdAndInstanceTypeAndStatusNotIn(Long id, Long organizationId, InstanceTypeEnum instanceType, List<ClaimTicketStatusEnum> status);

    Optional<ClaimTicket> findByIdAndInstanceTypeAndStatusNotIn(Long id, InstanceTypeEnum instanceType, List<ClaimTicketStatusEnum> status);

}
