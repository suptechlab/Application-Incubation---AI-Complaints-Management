package com.seps.admin.service.impl;


import com.google.gson.Gson;
import com.seps.admin.component.CommonHelper;
import com.seps.admin.component.DateUtil;
import com.seps.admin.component.EnumUtil;
import com.seps.admin.config.Constants;
import com.seps.admin.domain.AuditLog;
import com.seps.admin.enums.ActivityTypeEnum;
import com.seps.admin.enums.excel.header.ExcelHeaderAuditLogEnum;
import com.seps.admin.repository.AuditLogRepository;
import com.seps.admin.service.AuditLogService;
import com.seps.admin.service.dto.AuditListDTO;
import com.seps.admin.service.dto.RequestInfo;
import com.seps.admin.service.specification.AuditLogSpecification;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final Logger log = LoggerFactory.getLogger(AuditLogServiceImpl.class);

    private final AuditLogRepository auditLogRepository;

    private final CommonHelper commonHelper;

    private final Gson gson;
    private final EnumUtil enumUtil;

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
            // Get the message for the current locale, fallback to "en" if not found
            String message = data.getMessage().get(LocaleContextHolder.getLocale().toString());
            if (message == null) {
                message = data.getMessage().get("en");
            }
            dto.setMessage(message);
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

    @Override
    public ByteArrayInputStream downloadAuditLogs(String search, ActivityTypeEnum activityType, String startDate, String endDate) throws IOException {
        log.debug("download audit log");
        List<AuditLog> dataList = auditLogRepository.findAll(AuditLogSpecification.byFilter(search, activityType, startDate, endDate));

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Audit logs");

            // Header
            Row headerRow = sheet.createRow(0);

            for (ExcelHeaderAuditLogEnum header : ExcelHeaderAuditLogEnum.values()) {
                // Use ordinal() to determine the column index
                Cell cell = headerRow.createCell(header.ordinal());
                cell.setCellValue(enumUtil.getLocalizedEnumValue(header, LocaleContextHolder.getLocale()));
            }
            // Populate data rows
            int rowIdx = 1;
            for (AuditLog data : dataList) {
                Row row = sheet.createRow(rowIdx++);
                createRows(data, row);
            }

            // Auto-size columns
            for (ExcelHeaderAuditLogEnum header : ExcelHeaderAuditLogEnum.values()) {
                sheet.autoSizeColumn(header.ordinal());
            }
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    private void createRows(AuditLog data, Row row) {
        row.createCell(ExcelHeaderAuditLogEnum.ID.ordinal()).setCellValue(data.getId() != null ? data.getId().toString() : "");
        row.createCell(ExcelHeaderAuditLogEnum.IP_ADDRESS.ordinal()).setCellValue(data.getIpAddress() != null ? data.getIpAddress() : "");
        row.createCell(ExcelHeaderAuditLogEnum.USER_ID.ordinal()).setCellValue(data.getUserId() != null ? data.getUserId().toString() : "");
        row.createCell(ExcelHeaderAuditLogEnum.LOGGED_BY.ordinal()).setCellValue(data.getLoggedUser() != null ? data.getLoggedUser().getFirstName() : "");
        row.createCell(ExcelHeaderAuditLogEnum.MICROSERVICE.ordinal()).setCellValue(data.getMicroservice() != null ? data.getMicroservice() : "");
        row.createCell(ExcelHeaderAuditLogEnum.REQUEST.ordinal()).setCellValue(data.getRequest() != null ? data.getRequest() : "");
        row.createCell(ExcelHeaderAuditLogEnum.REQUEST_BODY.ordinal()).setCellValue(data.getRequestBody() != null ? data.getRequestBody() : "");
        row.createCell(ExcelHeaderAuditLogEnum.METHOD.ordinal()).setCellValue(data.getMethod() != null ? data.getMethod() : "");
        row.createCell(ExcelHeaderAuditLogEnum.ACTION_TYPE.ordinal()).setCellValue(data.getActionType() != null ? data.getActionType() : "");
        row.createCell(ExcelHeaderAuditLogEnum.ENTITY_ID.ordinal()).setCellValue(data.getEntityId() != null ? data.getEntityId().toString() : "");
        row.createCell(ExcelHeaderAuditLogEnum.ENTITY_NAME.ordinal()).setCellValue(data.getEntityName() != null ? data.getEntityName() : "");
        row.createCell(ExcelHeaderAuditLogEnum.ENTITY_DATA.ordinal()).setCellValue(data.getEntityData() != null ? data.getEntityData().toString() : "");
        // Get the message for the current locale, fallback to "en" if not found
        String message = data.getMessage().get(LocaleContextHolder.getLocale().toString());
        if (message == null) {
            message = data.getMessage().get("en");
        }
        row.createCell(ExcelHeaderAuditLogEnum.MESSAGE.ordinal()).setCellValue(message);
        row.createCell(ExcelHeaderAuditLogEnum.ACTIVITY_TYPE.ordinal()).setCellValue(data.getActivityType() != null ? data.getActivityType() : "");
        row.createCell(ExcelHeaderAuditLogEnum.CREATED_AT.ordinal()).setCellValue(data.getCreatedAt() != null ? DateUtil.formatDate(data.getCreatedAt(), LocaleContextHolder.getLocale().getLanguage()) : "");
    }

}
