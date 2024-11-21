package com.seps.ticket.service;

import com.seps.ticket.service.dto.TicketDTO;
import com.seps.ticket.web.rest.vm.ClaimTicketRequest;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClaimTicketService {

    @Transactional
    public TicketDTO createTicket(@Valid ClaimTicketRequest claimTicketRequest) {
        return null;
    }
}
