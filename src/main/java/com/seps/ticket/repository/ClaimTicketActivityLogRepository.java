package com.seps.ticket.repository;


import com.seps.ticket.domain.ClaimTicketActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClaimTicketActivityLogRepository extends JpaRepository<ClaimTicketActivityLog, Long> {
}
