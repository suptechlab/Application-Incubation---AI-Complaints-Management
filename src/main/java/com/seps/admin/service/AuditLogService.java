package com.seps.admin.service;

import com.seps.admin.domain.AuditLog;
import com.seps.admin.enums.ActivityTypeEnum;
import com.seps.admin.service.dto.AuditListDTO;
import com.seps.admin.service.dto.RequestInfo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Map;

public interface AuditLogService {


    @Transactional
    void logActivity(Long userId, Long loggedBy, RequestInfo request, String method, String actionType,
                     Long entityId, String entityName, Map<String, String> entityTitle, Map<String, String> message,
                     Map<String, Object> data, String activityType, String requestBody);

    Page<AuditListDTO> listAuditLogs(Pageable pageable, String search, ActivityTypeEnum activityType, String startDate, String endDate);

    AuditLog getAuditLogById(Long id);

    ByteArrayInputStream downloadAuditLogs(String search, ActivityTypeEnum activityType, String startDate, String endDate) throws IOException;
}
