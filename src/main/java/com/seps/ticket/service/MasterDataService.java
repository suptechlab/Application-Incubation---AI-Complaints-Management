package com.seps.ticket.service;

import com.seps.ticket.component.EnumUtil;
import com.seps.ticket.domain.Authority;
import com.seps.ticket.domain.User;
import com.seps.ticket.enums.*;
import com.seps.ticket.security.AuthoritiesConstants;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Service class responsible for providing master data for various enums used in the application.
 * It utilizes {@link EnumUtil} to localize the enum values based on the provided locale.
 */
@Service
public class MasterDataService {

    private final EnumUtil enumUtil;

    private final UserService userService;

    /**
     * Constructor for {@link MasterDataService}.
     *
     * @param enumUtil The utility component for enum localization.
     */
    public MasterDataService(EnumUtil enumUtil, UserService userService) {
        this.enumUtil = enumUtil;
        this.userService = userService;
    }

    /**
     * Retrieves a map of localized master data for various enums based on the given locale.
     *
     * @param locale The {@link Locale} used for localizing the enum descriptions.
     * @return A map containing the localized master data, where the key is the enum name
     * (e.g., "customerType", "priorityCareGroup") and the value is a map of enum entries
     * with their localized descriptions.
     */
    public Map<String, Object> getMasterData(Locale locale) {

        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        // Check if the user is FI-Admin
        boolean isFiAdmin = authority.contains(AuthoritiesConstants.FI);

        Map<String, Object> masterData = new HashMap<>();

        // Adding localized data for Customer Type enum
        masterData.put("customerType", enumUtil.enumToLocalizedMap(CustomerTypeEnum.class, locale));

        // Adding localized data for Priority Care Group enum
        masterData.put("priorityCareGroup", enumUtil.enumToLocalizedMap(PriorityCareGroupEnum.class, locale));

        // Adding localized data for Claim Ticket Priority enum
        masterData.put("claimTicketPriority", enumUtil.enumToLocalizedMap(ClaimTicketPriorityEnum.class, locale));

        // Adding localized data for Claim Ticket Status enum
        masterData.put("claimTicketStatus", enumUtil.enumToLocalizedMap(ClaimTicketStatusEnum.class, locale));

        // Adding localized data for Closed Status enum
        masterData.put("closedStatus", enumUtil.enumToLocalizedMap(ClosedStatusEnum.class, locale));

        // Adding localized data for Instance Type enum
        masterData.put("instanceType", enumUtil.enumToLocalizedMap(InstanceTypeEnum.class, locale));

        // Adding localized data for Rejected Status enum
        masterData.put("rejectedStatus", enumUtil.enumToLocalizedMap(RejectedStatusEnum.class, locale));
        // Adding localized data for Ticket Workflow Status enum
        masterData.put("ticketWorkflowEvent", enumUtil.enumToLocalizedMap(TicketWorkflowEventEnum.class, locale));

        // Adding filtered localized data for specific enums

        // CreateActionEnum
        masterData.put("createAction", enumUtil.createFilteredEnumMap(
            CreateActionEnum.values(),
            locale,
            isFiAdmin ? new CreateActionEnum[]{CreateActionEnum.MAIL_TO_SEPS_TEAM, CreateActionEnum.MAIL_TO_SEPS_AGENT} : new CreateActionEnum[]{}
        ));

        // TicketStatusActionEnum
        masterData.put("ticketStatusAction", enumUtil.createFilteredEnumMap(
            TicketStatusActionEnum.values(),
            locale,
            isFiAdmin ? new TicketStatusActionEnum[]{TicketStatusActionEnum.MAIL_TO_SEPS_TEAM, TicketStatusActionEnum.MAIL_TO_SEPS_AGENT} : new TicketStatusActionEnum[]{}
        ));

        // TicketPriorityActionEnum
        masterData.put("ticketPriorityAction", enumUtil.createFilteredEnumMap(
            TicketPriorityActionEnum.values(),
            locale,
            isFiAdmin ? new TicketPriorityActionEnum[]{TicketPriorityActionEnum.MAIL_TO_SEPS_TEAM, TicketPriorityActionEnum.MAIL_TO_SEPS_AGENT} : new TicketPriorityActionEnum[]{}
        ));

        // SLADaysReminderActionEnum
        masterData.put("slaDaysReminderAction", enumUtil.createFilteredEnumMap(
            SLADaysReminderActionEnum.values(),
            locale,
            isFiAdmin ? new SLADaysReminderActionEnum[]{SLADaysReminderActionEnum.MAIL_TO_SEPS_TEAM, SLADaysReminderActionEnum.MAIL_TO_SEPS_AGENT} : new SLADaysReminderActionEnum[]{}
        ));


        // SLABreachActionEnum
        masterData.put("slaBreachAction", enumUtil.createFilteredEnumMap(
            SLABreachActionEnum.values(),
            locale,
            isFiAdmin ? new SLABreachActionEnum[]{SLABreachActionEnum.MAIL_TO_SEPS_TEAM, SLABreachActionEnum.MAIL_TO_SEPS_AGENT} : new SLABreachActionEnum[]{}
        ));

        // TicketDateExtensionActionEnum
        masterData.put("ticketDateExtensionAction", enumUtil.createFilteredEnumMap(
            TicketDateExtensionActionEnum.values(),
            locale,
            isFiAdmin ? new TicketDateExtensionActionEnum[]{TicketDateExtensionActionEnum.MAIL_TO_SEPS_TEAM, TicketDateExtensionActionEnum.MAIL_TO_SEPS_AGENT} : new TicketDateExtensionActionEnum[]{}
        ));

        return masterData;
    }


}
