package com.seps.ticket.web.rest.vm;

import com.seps.ticket.enums.ChannelOfEntryEnum;
import com.seps.ticket.enums.CustomerTypeEnum;
import com.seps.ticket.enums.PriorityCareGroupEnum;
import com.seps.ticket.enums.SourceEnum;
import lombok.Data;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Data
@ToString
public class ClaimTicketRequestForJson {
    private String identificacion; // read-only
    private String email; // read-only
    private String name; // read-only
    private String gender; // read-only
    private String countryCode;
    private String phoneNumber;
    private Long provinceId;
    private Long cityId;
    private PriorityCareGroupEnum priorityCareGroup;
    private CustomerTypeEnum customerType;
    private Long organizationId;
    private Long claimTypeId;
    private Long claimSubTypeId;
    private String precedents;
    private String specificPetition;
    private Boolean checkDuplicate = true;
    private List<String> attachments = new ArrayList<>();
    private SourceEnum source;
    private ChannelOfEntryEnum channelOfEntry;
    private List<Long> attachmentsIds = new ArrayList<>();
}
