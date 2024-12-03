package com.seps.ticket.repository;

import com.seps.ticket.domain.ClaimTicketInstanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClaimTicketInstanceLogRepository extends JpaRepository<ClaimTicketInstanceLog, Long> {
    // Custom query methods if needed
}
