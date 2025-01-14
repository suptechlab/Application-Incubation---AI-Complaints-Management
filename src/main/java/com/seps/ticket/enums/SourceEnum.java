package com.seps.ticket.enums;

import com.seps.ticket.component.EnumWithDescription;

public enum SourceEnum implements EnumWithDescription {

    WEB("enum.source.web"),
    AGENT("enum.source.agent"),
    CHATBOT("enum.source.chatbot");

    private final String key;

    SourceEnum(String key) {
        this.key = key;
    }

    @Override
    public String getDescription() {
        return this.key;
    }

}
