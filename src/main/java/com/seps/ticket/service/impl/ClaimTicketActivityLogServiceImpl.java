package com.seps.ticket.service.impl;


import com.seps.ticket.domain.ClaimTicketActivityLog;
import com.seps.ticket.repository.ClaimTicketActivityLogRepository;
import com.seps.ticket.service.ClaimTicketActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClaimTicketActivityLogServiceImpl implements ClaimTicketActivityLogService {

    private final ClaimTicketActivityLogRepository repository;

    @Override
    public void saveActivityLog(ClaimTicketActivityLog activityLog) {
        repository.save(activityLog);
    }
}
