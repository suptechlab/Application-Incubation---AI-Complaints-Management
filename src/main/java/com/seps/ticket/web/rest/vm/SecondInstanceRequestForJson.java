package com.seps.ticket.web.rest.vm;

import com.seps.ticket.enums.ChannelOfEntryEnum;
import com.seps.ticket.enums.SourceEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SecondInstanceRequestForJson {
    private Long id;
    private String comment;
    private List<String> attachments = new ArrayList<>();
    private SourceEnum source;
    private ChannelOfEntryEnum channelOfEntry;
    private List<Long> attachmentsIds = new ArrayList<>();
}
