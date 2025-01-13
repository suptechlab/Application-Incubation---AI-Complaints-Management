package com.seps.admin.service.dto;

import lombok.Data;
import lombok.ToString;

import java.time.Instant;


@Data
@ToString
public class AuditListDTO {

    private Long id;
    private Instant createdAt;
    private String userName;
    private String activityType;
    private String message;
    private String ipAddress;

}
