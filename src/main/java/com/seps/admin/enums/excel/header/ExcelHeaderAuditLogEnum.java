package com.seps.admin.enums.excel.header;

import com.seps.admin.component.EnumWithDescription;

public enum ExcelHeaderAuditLogEnum implements EnumWithDescription {
    ID("excel.header.id"),
    IP_ADDRESS("excel.header.ipAddress"),
    USER_ID("excel.header.userId"),
    LOGGED_BY("excel.header.loggedBy"),
    MICROSERVICE("excel.header.microservice"),
    MESSAGE("excel.header.message"),
    REQUEST("excel.header.request"),
    REQUEST_BODY("excel.header.requestBody"),
    METHOD("excel.header.method"),
    ACTION_TYPE("excel.header.actionType"),
    ENTITY_ID("excel.header.entityId"),
    ENTITY_NAME("excel.header.entityName"),
    ENTITY_DATA("excel.header.entityData"),
    ACTIVITY_TYPE("excel.header.activityType"),
    CREATED_AT("excel.header.createdAt");

    private final String key;

    ExcelHeaderAuditLogEnum(String key) {
        this.key = key;
    }

    @Override
    public String getDescription() {
        return this.key;
    }
}
