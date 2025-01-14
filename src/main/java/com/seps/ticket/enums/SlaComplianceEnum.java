package com.seps.ticket.enums;

import com.seps.ticket.component.EnumWithDescription;

public enum SlaComplianceEnum implements EnumWithDescription {

    COMPLIANT("enum.compliance.compliant"),
    NON_COMPLIANT("enum.compliance.non.compliant");

    private final String key;

    SlaComplianceEnum(String key) {
        this.key = key;
    }

    @Override
    public String getDescription() {
        return this.key;
    }

}
