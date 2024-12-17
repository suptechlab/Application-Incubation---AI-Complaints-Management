package com.seps.ticket.repository;

import com.seps.ticket.domain.ClaimTicketStatusLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClaimTicketStatusLogRepository extends JpaRepository<ClaimTicketStatusLog, Long> {
    // Custom query methods if needed
}
