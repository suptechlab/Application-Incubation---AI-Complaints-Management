package com.seps.ticket.service;

import com.seps.ticket.domain.ClaimTicketActivityLog;
import com.seps.ticket.service.dto.ClaimTicketActivityLogDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ClaimTicketActivityLogService {
    void saveActivityLog(ClaimTicketActivityLog activityLog);

    Page<ClaimTicketActivityLogDTO> getAllActivities(Long ticketId, Pageable pageable);
}
