package com.seps.ticket.enums;

import com.seps.ticket.component.EnumWithDescription;

public enum ChannelOfEntryEnum implements EnumWithDescription {

    WALK_IN("enum.channel.walk.in"),
    ON_CALL("enum.channel.on.call"),
    MAIL_BOX("enum.mail.box"),
    DIGITAL_MEDIA("enum.digital.media"),
    EMAIL("enum.channel.email"),
    WEB("enum.source.web"),
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

