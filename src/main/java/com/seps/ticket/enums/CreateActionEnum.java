package com.seps.ticket.enums;

import com.seps.ticket.component.EnumWithDescription;

public enum CreateActionEnum implements EnumWithDescription {
    ASSIGN_TO_TEAM("enum.assign.to.team"),
    ASSIGN_TO_AGENT("enum.assign.to.agent"),
    MAIL_TO_CUSTOMER("enum.mail.to.customer"),
    MAIL_TO_FI_TEAM("enum.mail.to.fi.team"),
    MAIL_TO_FI_AGENT("enum.mail.to.fi.agent"),
    MAIL_TO_SEPS_TEAM("enum.mail.to.seps.team"),
    MAIL_TO_SEPS_AGENT("enum.mail.to.seps.agent");

    private final String key;

    CreateActionEnum(String key) {
        this.key = key;
    }

    @Override
    public String getDescription() {
        return this.key;
    }
}
