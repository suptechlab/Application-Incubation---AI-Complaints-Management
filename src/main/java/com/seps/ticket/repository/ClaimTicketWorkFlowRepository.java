package com.seps.ticket.repository;

import com.seps.ticket.domain.ClaimTicketWorkFlow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClaimTicketWorkFlowRepository extends JpaRepository<ClaimTicketWorkFlow, Long> {

    Optional<ClaimTicketWorkFlow> findByIdAndOrganizationId(Long id, Long organizationId);
}
