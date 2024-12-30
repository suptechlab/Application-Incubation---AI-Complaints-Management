package com.seps.ticket.repository;

import com.seps.ticket.domain.ClaimTicketWorkFlow;
import com.seps.ticket.enums.InstanceTypeEnum;
import com.seps.ticket.enums.TicketWorkflowEventEnum;
import com.seps.ticket.service.mapper.UserMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimTicketWorkFlowRepository extends JpaRepository<ClaimTicketWorkFlow, Long>, JpaSpecificationExecutor<ClaimTicketWorkFlow> {

    Optional<ClaimTicketWorkFlow> findByIdAndOrganizationId(Long id, Long organizationId);

    List<ClaimTicketWorkFlow> findByOrganizationIdAndInstanceTypeAndEventAndStatus(Long organizationId, InstanceTypeEnum instanceType, TicketWorkflowEventEnum ticketWorkflowEventEnum, boolean status);

    List<ClaimTicketWorkFlow> findByEventInAndStatusTrue(List<TicketWorkflowEventEnum> ticketWorkflowEventEnum);
}
