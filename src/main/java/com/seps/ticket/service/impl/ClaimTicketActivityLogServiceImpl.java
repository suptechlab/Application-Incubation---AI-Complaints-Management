package com.seps.ticket.service.impl;


import com.seps.ticket.domain.ClaimTicketActivityLog;
import com.seps.ticket.enums.ClaimTicketActivityEnum;
import com.seps.ticket.repository.ClaimTicketActivityLogRepository;
import com.seps.ticket.service.ClaimTicketActivityLogService;
import com.seps.ticket.service.dto.ClaimTicketActivityLogDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ClaimTicketActivityLogServiceImpl implements ClaimTicketActivityLogService {

    private final ClaimTicketActivityLogRepository repository;

    @Override
    public void saveActivityLog(ClaimTicketActivityLog activityLog) {
        repository.save(activityLog);
    }

    @Override
    public Page<ClaimTicketActivityLogDTO> getAllActivities(Long ticketId, Pageable pageable) {

        Locale locale = LocaleContextHolder.getLocale();
        return repository.findAllByTicketId(ticketId, pageable)
                .map(activity -> mapToDTO(activity, locale));
    }

    @Override
    public Page<ClaimTicketActivityLogDTO> getAllConversation(Long ticketId, Pageable pageable) {
        Locale locale = LocaleContextHolder.getLocale();
        List<String> activityTypes = List.of(ClaimTicketActivityEnum.CUSTOMER_REPLY.name(), ClaimTicketActivityEnum.REPLY_CUSTOMER.name());
        return repository.findAllByTicketIdAndActivityTypeIn(ticketId, activityTypes, pageable)
            .map(activity -> mapToDTO(activity, locale));
    }

    @Override
    public List<ClaimTicketActivityLogDTO> getAllActivities(Long ticketId) {
        Locale locale = LocaleContextHolder.getLocale();
        return repository.findAllByTicketIdOrderByPerformedAtDesc(ticketId)
            .stream().map(activity -> mapToDTO(activity, locale)).toList();
    }

    @Override
    public List<ClaimTicketActivityLogDTO> getAllConversation(Long ticketId) {
        Locale locale = LocaleContextHolder.getLocale();
        List<String> activityTypes = List.of(ClaimTicketActivityEnum.CUSTOMER_REPLY.name(),
            ClaimTicketActivityEnum.REPLY_CUSTOMER.name(),
            ClaimTicketActivityEnum.ASSIGNED.name(),
            ClaimTicketActivityEnum.REASSIGNED.name(),
            ClaimTicketActivityEnum.CHANGED_PRIORITY.name(),
            ClaimTicketActivityEnum.DATE_EXTENDED.name(),
            ClaimTicketActivityEnum.REJECTED.name(),
            ClaimTicketActivityEnum.STATUS_CHANGED.name());
        return repository.findAllByTicketIdAndActivityTypeInOrderByPerformedAtDesc(ticketId, activityTypes).stream()
            .map(activity -> mapToDTO(activity, locale)).toList();
    }

    private ClaimTicketActivityLogDTO mapToDTO(ClaimTicketActivityLog activity, Locale locale) {
        String activityTitle = activity.getActivityTitle().getOrDefault(locale.getLanguage(), "Title not available");

        return new ClaimTicketActivityLogDTO(
                activity.getId(),
                activity.getTicketId(),
                activity.getPerformedBy(),
                activity.getPerformedAt(),
                activity.getActivityType(),
                activityTitle,
                activity.getActivityDetails(),
                activity.getLinkedUsers(),
                activity.getTaggedUsers(),
                activity.getAttachmentUrl()
        );
    }
}
