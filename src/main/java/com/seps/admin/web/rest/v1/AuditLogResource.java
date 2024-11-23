package com.seps.admin.web.rest.v1;

import com.seps.admin.aop.permission.PermissionCheck;
import com.seps.admin.domain.AuditLog;
import com.seps.admin.enums.ActivityTypeEnum;
import com.seps.admin.service.AuditLogService;
import com.seps.admin.service.dto.AuditListDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-logs")
public class AuditLogResource {

    private final AuditLogService auditLogService;

    public AuditLogResource(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping("/{id}")
    @PermissionCheck({"AUDIT_TRAILS_VIEW"})
    public ResponseEntity<AuditLog> getAuditLogById(@PathVariable Long id) {
        return ResponseEntity.ok(auditLogService.getAuditLogById(id));
    }

    @GetMapping
    @PermissionCheck({"AUDIT_TRAILS_VIEW"})
    public ResponseEntity<List<AuditListDTO>> listAuditLogs(Pageable pageable,
                                                            @RequestParam(required = false) String search,
                                                            @RequestParam(required = false) ActivityTypeEnum activityType,
                                                            @RequestParam(required = false) String startDate,
                                                            @RequestParam(required = false) String endDate) {
        Page<AuditListDTO> page = auditLogService.listAuditLogs(pageable, search, activityType, startDate, endDate);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }


}
