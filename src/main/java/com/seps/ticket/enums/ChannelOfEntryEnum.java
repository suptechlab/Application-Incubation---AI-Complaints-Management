package com.seps.ticket.enums;

import com.seps.ticket.component.EnumWithDescription;

public enum ChannelOfEntryEnum implements EnumWithDescription {

    /**
     * Represents claims submitted by agents during a call interaction with the user via the Agent Portal.
     */
    ON_CALL("enum.channel.on.call"),

    /**
     * Represents claims submitted by agents on behalf of users via email through the Agent Portal.
     */
    EMAIL("enum.channel.email"),

    /**
     * Represents claims submitted by agents on behalf of users who walk into the office, using the Agent Portal.
     */
    WALK_IN("enum.channel.walk.in"),

    /**
     * Represents claims submitted by agents on behalf of users through a chat interface via the Agent Portal.
     */
    CHAT("enum.channel.chat"),

    WHATSAPP("enum.channel.whatsapp"),

    FACEBOOK("enum.channel.facebook"),

    INSTAGRAM("enum.channel.instagram");

    private final String key;

    ChannelOfEntryEnum(String key) {
        this.key = key;
    }

    @Override
    public String getDescription() {
        return this.key;
    }

}

