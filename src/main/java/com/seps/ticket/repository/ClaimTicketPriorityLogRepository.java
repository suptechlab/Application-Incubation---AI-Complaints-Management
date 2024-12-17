package com.seps.ticket.repository;

import com.seps.ticket.domain.ClaimTicketPriorityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClaimTicketPriorityLogRepository extends JpaRepository<ClaimTicketPriorityLog, Long> {
    Optional<ClaimTicketPriorityLog> findFirstByTicketIdOrderByCreatedAtDesc(Long ticketId);
}
