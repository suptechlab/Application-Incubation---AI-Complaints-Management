package com.seps.ticket.service;

import com.seps.ticket.component.DateUtil;
import com.seps.ticket.component.EnumUtil;
import com.seps.ticket.domain.*;
import com.seps.ticket.enums.ClaimTicketActivityEnum;
import com.seps.ticket.enums.ClaimTicketPriorityEnum;
import com.seps.ticket.enums.ClaimTicketStatusEnum;
import com.seps.ticket.enums.InstanceTypeEnum;
import com.seps.ticket.repository.ClaimTicketActivityLogRepository;
import com.seps.ticket.repository.ClaimTicketInstanceLogRepository;
import com.seps.ticket.repository.ClaimTicketPriorityLogRepository;
import com.seps.ticket.repository.ClaimTicketStatusLogRepository;
import com.seps.ticket.service.dto.ClaimTicketDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tech.jhipster.config.JHipsterProperties;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class TemplateVariableMappingService {

    private final EnumUtil enumUtil;
    private final JHipsterProperties jHipsterProperties;
    private final ClaimTicketInstanceLogRepository instanceLogRepository;
    private final ClaimTicketPriorityLogRepository priorityLogRepository;
    private final ClaimTicketStatusLogRepository statusLogRepository;
    private final ClaimTicketActivityLogRepository claimTicketActivityLogRepository;

    @Value("${website.user-base-url:test}")
    private String userBaseUrl;


    public TemplateVariableMappingService(EnumUtil enumUtil, JHipsterProperties jHipsterProperties, ClaimTicketInstanceLogRepository instanceLogRepository, ClaimTicketPriorityLogRepository priorityLogRepository, ClaimTicketStatusLogRepository statusLogRepository, ClaimTicketActivityLogRepository claimTicketActivityLogRepository) {
        this.enumUtil = enumUtil;
        this.jHipsterProperties = jHipsterProperties;
        this.instanceLogRepository = instanceLogRepository;
        this.priorityLogRepository = priorityLogRepository;
        this.statusLogRepository = statusLogRepository;
        this.claimTicketActivityLogRepository = claimTicketActivityLogRepository;
    }

    public Map<String, String> mapVariables(ClaimTicketDTO claimTicketDTO, User sendToUser) {
        Map<String, String> variableMap = new HashMap<>();

        // Add mappings based on provided ClaimTicketDTO and User
        variableMap.put("username", sendToUser.getFirstName());
        variableMap.put("ticketNumber", String.valueOf(claimTicketDTO.getTicketId()));
        variableMap.put("assignedUser", claimTicketDTO.getFiAgent() != null ? claimTicketDTO.getFiAgent().getName() : "Unassigned");

        // Localized enum values
        Locale userLocale = Locale.forLanguageTag(sendToUser.getLangKey());
        variableMap.put("status", enumUtil.getLocalizedEnumValue(claimTicketDTO.getStatus(), userLocale));
        variableMap.put("closedStatus", enumUtil.getLocalizedEnumValue(claimTicketDTO.getClosedStatus(), userLocale));
        variableMap.put("rejectedStatus", enumUtil.getLocalizedEnumValue(claimTicketDTO.getRejectedStatus(), userLocale));
        variableMap.put("priority", enumUtil.getLocalizedEnumValue(claimTicketDTO.getPriority(), userLocale));
        variableMap.put("instanceType", enumUtil.getLocalizedEnumValue(claimTicketDTO.getInstanceType(), userLocale));

        // Claim details
        variableMap.put("instanceComment", claimTicketDTO.getSecondInstanceComment() != null ? claimTicketDTO.getSecondInstanceComment() : "");
        variableMap.put("claimType", claimTicketDTO.getClaimType() != null ? claimTicketDTO.getClaimType().getName() : "");
        variableMap.put("claimSubType", claimTicketDTO.getClaimSubType() != null ? claimTicketDTO.getClaimSubType().getName() : "");
        variableMap.put("razonSocial", claimTicketDTO.getOrganization() != null ? claimTicketDTO.getOrganization().getRazonSocial() : "");
        variableMap.put("ruc", claimTicketDTO.getOrganization() != null ? claimTicketDTO.getOrganization().getRuc() : "");
        variableMap.put("reason", claimTicketDTO.getStatusComment() != null ? claimTicketDTO.getStatusComment() : "");

        // Customer information
        variableMap.put("customerName", claimTicketDTO.getUser() != null ? claimTicketDTO.getUser().getName() : "");
        variableMap.put("customerEmail", claimTicketDTO.getUser() != null ? claimTicketDTO.getUser().getEmail() : "");

        // Dates
        variableMap.put("assignedDate", DateUtil.formatDate(claimTicketDTO.getAssignedAt(), sendToUser.getLangKey()));
        variableMap.put("createdDate", DateUtil.formatDate(claimTicketDTO.getCreatedAt(), sendToUser.getLangKey()));
        variableMap.put("secondInstanceFiledDate", DateUtil.formatDate(claimTicketDTO.getCreatedAt(), sendToUser.getLangKey()));
        variableMap.put("complaintFiledDate", DateUtil.formatDate(claimTicketDTO.getCreatedAt(), sendToUser.getLangKey()));
        variableMap.put("resolveOnDate", DateUtil.formatDate(claimTicketDTO.getResolvedOn(), sendToUser.getLangKey()));
        variableMap.put("slaBreachDate", DateUtil.formatDate(claimTicketDTO.getSlaBreachDate(), sendToUser.getLangKey()));
        variableMap.put("slaRemainingDays", DateUtil.getSlaBreachStatus(claimTicketDTO.getSlaBreachDate(), sendToUser.getLangKey()));

        // Agent names
        variableMap.put("fiAgentName", claimTicketDTO.getFiAgent() != null ? claimTicketDTO.getFiAgent().getName() : "N/A");
        variableMap.put("sepsAgentName", claimTicketDTO.getSepsAgent() != null ? claimTicketDTO.getSepsAgent().getName() : "N/A");
        if(claimTicketDTO.getInstanceType().equals(InstanceTypeEnum.FIRST_INSTANCE)) {
            variableMap.put("agentName", claimTicketDTO.getFiAgent() != null ? claimTicketDTO.getFiAgent().getName() : "N/A");
        }else {
            variableMap.put("agentName", claimTicketDTO.getSepsAgent() != null ? claimTicketDTO.getSepsAgent().getName() : "N/A");
        }
        // URLs
        variableMap.put("userTicketUrl", this.userBaseUrl + "/my-account?ticketId=" + claimTicketDTO.getTicketId());
        variableMap.put("adminTicketUrl", jHipsterProperties.getMail().getBaseUrl() + "/tickets/view/" + claimTicketDTO.getId());
        variableMap.put("url", this.userBaseUrl + "/my-account/" + claimTicketDTO.getTicketId());

        // Audit details
        variableMap.put("createdBy", claimTicketDTO.getCreatedByUser() != null ? claimTicketDTO.getCreatedByUser().getName() : "System");
        variableMap.put("updatedBy", claimTicketDTO.getUpdatedByUser() != null ? claimTicketDTO.getUpdatedByUser().getName() : "System");

        // Additional placeholders (can be customized)
        InstanceTypeEnum previousInstance = instanceLogRepository.findFirstByTicketIdOrderByCreatedAtDesc(claimTicketDTO.getId()).map(ClaimTicketInstanceLog::getInstanceType).orElse(null);
        variableMap.put("previousInstance", enumUtil.getLocalizedEnumValue(previousInstance, userLocale));

        ClaimTicketStatusEnum previousStatus = statusLogRepository.findFirstByTicketIdOrderByCreatedAtDesc(claimTicketDTO.getId()).map(ClaimTicketStatusLog::getStatus).orElse(null);
        variableMap.put("previousStatus", enumUtil.getLocalizedEnumValue(previousStatus, userLocale));

        ClaimTicketPriorityEnum previousPriority = priorityLogRepository.findFirstByTicketIdOrderByCreatedAtDesc(claimTicketDTO.getId()).map(ClaimTicketPriorityLog::getPriority).orElse(null);
        variableMap.put("previousPriority", enumUtil.getLocalizedEnumValue(previousPriority, userLocale)); // Placeholder

        ClaimTicketActivityLog previousExtensionDate = claimTicketActivityLogRepository
                .findFirstByTicketIdAndActivityTypeOrderByPerformedAtDesc(
                        claimTicketDTO.getId(),
                        ClaimTicketActivityEnum.DATE_EXTENDED.name()
                ).orElse(null);

        if (previousExtensionDate != null) {
            Map<String, Object> activityDetail = previousExtensionDate.getActivityDetails();

            // Extract previousSlaDate
            List<Integer> previousSlaDateList = (List<Integer>) activityDetail.get("previousSlaDate"); //NOSONAR
            LocalDate previousSlaDate = LocalDate.of(
                    previousSlaDateList.get(0), // Year
                    previousSlaDateList.get(1), // Month
                    previousSlaDateList.get(2)  // Day
            );

            // Extract text (reason)
            String reason = (String) activityDetail.get("text");
            variableMap.put(
                    "previousSlaDate",
                    DateUtil.formatDate(previousSlaDate, sendToUser.getLangKey())
            ); // Placeholder
            variableMap.put("reasonSlaDateExtension", reason); // Placeholder
        } else {
            // Handle the case when no previous extension date is found
            variableMap.put("previousSlaDate", "N/A");
            variableMap.put("reasonSlaDateExtension", "N/A");
        }

        return variableMap;
    }

    public Map<String, String> mapNotificationVariables(ClaimTicket claimTicketDTO, User sendToUser) {
        Map<String, String> variableMap = new HashMap<>();

        // Add mappings based on provided ClaimTicketDTO and User
        variableMap.put("username", sendToUser.getFirstName());
        variableMap.put("ticketNumber", String.valueOf(claimTicketDTO.getTicketId()));
        variableMap.put("assignedUser", claimTicketDTO.getFiAgent() != null ? claimTicketDTO.getFiAgent().getFirstName() : "Unassigned");

        // Localized enum values
        Locale userLocale = Locale.forLanguageTag(sendToUser.getLangKey());
        variableMap.put("status", enumUtil.getLocalizedEnumValue(claimTicketDTO.getStatus(), userLocale));
        variableMap.put("closedStatus", enumUtil.getLocalizedEnumValue(claimTicketDTO.getClosedStatus(), userLocale));
        variableMap.put("rejectedStatus", enumUtil.getLocalizedEnumValue(claimTicketDTO.getRejectedStatus(), userLocale));
        variableMap.put("priority", enumUtil.getLocalizedEnumValue(claimTicketDTO.getPriority(), userLocale));
        variableMap.put("instanceType", enumUtil.getLocalizedEnumValue(claimTicketDTO.getInstanceType(), userLocale));

        // Claim details
        variableMap.put("instanceComment", claimTicketDTO.getSecondInstanceComment() != null ? claimTicketDTO.getSecondInstanceComment() : "");
        variableMap.put("claimType", claimTicketDTO.getClaimType() != null ? claimTicketDTO.getClaimType().getName() : "");
        variableMap.put("claimSubType", claimTicketDTO.getClaimSubType() != null ? claimTicketDTO.getClaimSubType().getName() : "");
        variableMap.put("razonSocial", claimTicketDTO.getOrganization() != null ? claimTicketDTO.getOrganization().getRazonSocial() : "");
        variableMap.put("ruc", claimTicketDTO.getOrganization() != null ? claimTicketDTO.getOrganization().getRuc() : "");

        // Customer information
        variableMap.put("customerName", claimTicketDTO.getUser() != null ? claimTicketDTO.getUser().getFirstName() : "");
        variableMap.put("customerEmail", claimTicketDTO.getUser() != null ? claimTicketDTO.getUser().getEmail() : "");

        // Dates
        variableMap.put("assignedDate", DateUtil.formatDate(claimTicketDTO.getAssignedAt(), sendToUser.getLangKey()));
        variableMap.put("createdDate", DateUtil.formatDate(claimTicketDTO.getCreatedAt(), sendToUser.getLangKey()));
        variableMap.put("resolveOnDate", DateUtil.formatDate(claimTicketDTO.getResolvedOn(), sendToUser.getLangKey()));
        variableMap.put("slaBreachDate", DateUtil.formatDate(claimTicketDTO.getSlaBreachDate(), sendToUser.getLangKey()));
        variableMap.put("slaRemainingDays", DateUtil.getSlaBreachStatus(claimTicketDTO.getSlaBreachDate(), sendToUser.getLangKey()));

        // Agent names
        variableMap.put("fiAgentName", claimTicketDTO.getFiAgent() != null ? claimTicketDTO.getFiAgent().getFirstName() : "N/A");
        variableMap.put("sepsAgentName", claimTicketDTO.getSepsAgent() != null ? claimTicketDTO.getSepsAgent().getFirstName() : "N/A");
        if(claimTicketDTO.getInstanceType().equals(InstanceTypeEnum.FIRST_INSTANCE)) {
            variableMap.put("agentName", claimTicketDTO.getFiAgent() != null ? claimTicketDTO.getFiAgent().getFirstName() : "N/A");
        }else {
            variableMap.put("agentName", claimTicketDTO.getSepsAgent() != null ? claimTicketDTO.getSepsAgent().getFirstName() : "N/A");
        }

        // URLs
        variableMap.put("userTicketUrl", this.userBaseUrl + "/my-account?ticketId=" + claimTicketDTO.getTicketId());
        variableMap.put("adminTicketUrl", jHipsterProperties.getMail().getBaseUrl() + "/tickets/view/" + claimTicketDTO.getId());

        // Audit details
        variableMap.put("createdBy", claimTicketDTO.getCreatedByUser() != null ? claimTicketDTO.getCreatedByUser().getFirstName() : "System");
        variableMap.put("updatedBy", claimTicketDTO.getUpdatedByUser() != null ? claimTicketDTO.getUpdatedByUser().getFirstName() : "System");

        return variableMap;
    }
}
