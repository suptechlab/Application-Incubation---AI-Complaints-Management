package com.seps.ticket.repository;

import com.seps.ticket.domain.ClaimTicketAssignLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClaimTicketAssignLogRepository extends JpaRepository<ClaimTicketAssignLog, Long> {
    // Custom query methods if needed
}
