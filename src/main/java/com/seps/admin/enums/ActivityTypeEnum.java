package com.seps.admin.enums;

import lombok.Getter;

@Getter
public enum ActivityTypeEnum {
    DATA_ENTRY("Data Entry"),
    MODIFICATION("Modification"),
    STATUS_CHANGE("Status Change"),
    ACTIVITY("Activity");

    private final String description;

    ActivityTypeEnum(String description) {
        this.description = description;
    }

}
