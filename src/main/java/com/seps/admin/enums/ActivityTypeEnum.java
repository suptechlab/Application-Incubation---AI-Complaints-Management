package com.seps.admin.enums;

public enum ActivityTypeEnum {
    DATA_ENTRY("Data Entry"),
    MODIFICATION("Modification"),
    STATUS_CHANGE("Status Change"),
    ACTIVITY("Activity");

    private final String description;

    ActivityTypeEnum(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
