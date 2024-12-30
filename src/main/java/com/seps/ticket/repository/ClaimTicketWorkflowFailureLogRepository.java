package com.seps.ticket.repository;

import com.seps.ticket.domain.ClaimTicketWorkFlowFailureLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClaimTicketWorkflowFailureLogRepository extends JpaRepository<ClaimTicketWorkFlowFailureLog, Long> {

}
