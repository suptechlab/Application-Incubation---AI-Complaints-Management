package com.seps.ticket.service;

import com.seps.ticket.domain.ClaimTicketActivityLog;
import com.seps.ticket.service.dto.ClaimTicketActivityLogDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ClaimTicketActivityLogService {
    void saveActivityLog(ClaimTicketActivityLog activityLog);

    Page<ClaimTicketActivityLogDTO> getAllActivities(Long ticketId, Pageable pageable);

    Page<ClaimTicketActivityLogDTO> getAllConversation(Long ticketId, Pageable pageable);

    long getConversationCount(Long ticketId);

    List<ClaimTicketActivityLogDTO> getAllActivities(Long ticketId);

    List<ClaimTicketActivityLogDTO> getAllConversation(Long ticketId);
}
