package com.seps.user.service.impl;



import com.google.gson.Gson;
import com.seps.user.component.CommonHelper;
import com.seps.user.config.Constants;
import com.seps.user.domain.AuditLog;
import com.seps.user.repository.AuditLogRepository;
import com.seps.user.service.AuditLogService;
import com.seps.user.service.dto.RequestInfo;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final Logger log = LoggerFactory.getLogger(AuditLogServiceImpl.class);

    private final AuditLogRepository auditLogRepository;

    private final CommonHelper commonHelper;

    private final Gson gson;

    @Override
    @Transactional
    public void logActivity(Long userId, Long loggedBy, RequestInfo request, String method, String actionType,
                            Long entityId, String entityName, Map<String, String> entityTitle, Map<String, String> message,
                            Map<String, Object> entityData, String activityType, String requestBody) {
        AuditLog auditLog = new AuditLog();
        auditLog.setIpAddress(commonHelper.getRemoteInfo());
        auditLog.setUserId(userId);
        auditLog.setLoggedBy(loggedBy);
        auditLog.setMicroservice(Constants.MICROSERVICE_NAME);
        auditLog.setRequest(gson.toJson(request));
        auditLog.setRequestBody(requestBody);
        auditLog.setMethod(method);
        auditLog.setActionType(actionType);
        auditLog.setEntityId(entityId);
        auditLog.setEntityName(entityName);
        auditLog.setEntityTitle(entityTitle);
        auditLog.setMessage(message);
        auditLog.setEntityData(entityData);
        auditLog.setActivityType(activityType);
        auditLog.setCreatedAt(Instant.now());
        auditLogRepository.save(auditLog);
    }

}
