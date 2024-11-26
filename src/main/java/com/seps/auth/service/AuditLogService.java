package com.seps.auth.service;

import com.seps.auth.service.dto.RequestInfo;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

public interface AuditLogService {


    @Transactional
    void logActivity(Long userId, Long loggedBy, RequestInfo request, String method, String actionType,
                     Long entityId, String entityName, Map<String, String> entityTitle, Map<String, String> message,
                     Map<String, Object> data, String activityType, String requestBody);
}
