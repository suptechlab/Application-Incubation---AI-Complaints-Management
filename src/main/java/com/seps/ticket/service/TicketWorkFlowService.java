package com.seps.ticket.service;

import com.seps.ticket.service.dto.workflow.TicketWorkflowDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TicketWorkFlowService {

    private static final Logger LOG = LoggerFactory.getLogger(TicketWorkFlowService.class);

    @Transactional
    public void createTicketWorkFlow(TicketWorkflowDTO ticketWorkflowDTO) {
        LOG.debug("ticket work flow:{}", ticketWorkflowDTO);
    }

}
