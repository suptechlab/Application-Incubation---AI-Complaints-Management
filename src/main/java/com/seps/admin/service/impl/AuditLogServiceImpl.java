package com.seps.admin.service.impl;



import com.google.gson.Gson;
import com.seps.admin.component.CommonHelper;
import com.seps.admin.config.Constants;
import com.seps.admin.domain.AuditLog;
import com.seps.admin.enums.ActivityTypeEnum;
import com.seps.admin.repository.AuditLogRepository;
import com.seps.admin.service.AuditLogService;
import com.seps.admin.service.dto.AuditListDTO;
import com.seps.admin.service.dto.RequestInfo;
import com.seps.admin.service.specification.AuditLogSpecification;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

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

    @Override
    public Page<AuditListDTO> listAuditLogs(Pageable pageable, String search, ActivityTypeEnum activityType, String startDate, String endDate) {
        return auditLogRepository.findAll(AuditLogSpecification.byFilter(search, activityType, startDate, endDate), pageable).map(data->{
            AuditListDTO dto = new AuditListDTO();
            dto.setId(data.getId());
            dto.setUserName(data.getLoggedUser().getFirstName());
            dto.setIpAddress(data.getIpAddress());
            dto.setActivityType(ActivityTypeEnum.valueOf(data.getActivityType()).getDescription());
            dto.setCreatedAt(data.getCreatedAt());
            return dto;
        });

    }

    @Override
    public AuditLog getAuditLogById(Long id) {
        return auditLogRepository.findById(id)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.AUDIT_LOG_NOT_FOUND,
                new String[]{id.toString()}, null));
    }
}
