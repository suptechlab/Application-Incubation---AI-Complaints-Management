package com.seps.ticket.repository;


import com.seps.ticket.domain.ClaimTicketActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface ClaimTicketActivityLogRepository extends JpaRepository<ClaimTicketActivityLog, Long> {
    Page<ClaimTicketActivityLog> findAllByTicketId(Long ticketId, Pageable pageable);

    List<ClaimTicketActivityLog> findAllByTicketId(Long ticketId);

    Page<ClaimTicketActivityLog> findAllByTicketIdAndActivityTypeIn(Long ticketId, List<String> activityTypes, Pageable pageable);

    Optional<ClaimTicketActivityLog> findFirstByTicketIdAndActivityTypeOrderByPerformedAtDesc(Long ticketId, String activityTpe);
}
