package com.seps.ticket.service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.seps.ticket.component.EnumUtil;
import com.seps.ticket.config.Constants;
import com.seps.ticket.config.InstantTypeAdapter;
import com.seps.ticket.domain.*;
import com.seps.ticket.enums.*;
import com.seps.ticket.repository.ClaimTicketRepository;
import com.seps.ticket.repository.ClaimTicketStatusLogRepository;
import com.seps.ticket.repository.ClaimTicketWorkFlowRepository;
import com.seps.ticket.repository.TemplateMasterRepository;
import com.seps.ticket.service.dto.ClaimTicketDTO;
import com.seps.ticket.service.dto.RequestInfo;
import com.seps.ticket.service.dto.workflow.ClaimTicketWorkFlowDTO;
import com.seps.ticket.service.dto.workflow.SLABreachAction;
import com.seps.ticket.service.dto.workflow.SLADaysReminderAction;
import com.seps.ticket.service.dto.workflow.SLADaysReminderCondition;
import com.seps.ticket.service.mapper.ClaimTicketMapper;
import com.seps.ticket.service.mapper.ClaimTicketWorkFlowMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import static com.seps.ticket.component.CommonHelper.convertEntityToMap;

/**
 * Service class that handles cron job tasks related to claim ticket workflows.
 * It coordinates operations such as updating claim ticket statuses, sending email notifications,
 * logging claim ticket activities, and auditing actions related to claim tickets.
 * The service interacts with various repositories and services to manage claim tickets' lifecycle.
 */
@Service
@Transactional
public class CronService {

    private static final Logger LOG = LoggerFactory.getLogger(CronService.class);

    private final ClaimTicketWorkFlowRepository claimTicketWorkFlowRepository;
    private final ClaimTicketRepository claimTicketRepository;
    private final ClaimTicketWorkFlowMapper claimTicketWorkFlowMapper;
    private final ClaimTicketWorkFlowService claimTicketWorkFlowService;
    private final UserService userService;
    private final TemplateMasterRepository templateMasterRepository;
    private final ClaimTicketMapper claimTicketMapper;
    private final MailService mailService;
    private final MessageSource messageSource;
    private final ClaimTicketActivityLogService claimTicketActivityLogService;
    private final ClaimTicketStatusLogRepository claimTicketStatusLogRepository;
    private final EnumUtil enumUtil;
    private final Gson gson;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final TemplateVariableMappingService templateVariableMappingService;

    private static final Long SYSTEM_ADMIN = 1L;

    /**
     * Constructs a new CronService with the provided dependencies.
     *
     * @param claimTicketWorkFlowRepository The repository for handling claim ticket workflows.
     * @param claimTicketRepository The repository for handling claim ticket data.
     * @param claimTicketWorkFlowMapper Mapper for converting between claim ticket workflow entities and DTOs.
     * @param claimTicketWorkFlowService Service for managing claim ticket workflows.
     * @param userService Service for managing user data and operations.
     * @param templateMasterRepository The repository for handling template data.
     * @param claimTicketMapper Mapper for converting between claim ticket entities and DTOs.
     * @param mailService Service for sending emails.
     * @param messageSource Service for resolving messages from properties files.
     * @param claimTicketActivityLogService Service for logging claim ticket activities.
     * @param claimTicketStatusLogRepository Repository for handling claim ticket status logs.
     * @param enumUtil Utility class for managing enums.
     * @param auditLogService Service for managing audit logs.
     */
    public CronService(ClaimTicketWorkFlowRepository claimTicketWorkFlowRepository, ClaimTicketRepository claimTicketRepository, ClaimTicketWorkFlowMapper claimTicketWorkFlowMapper, ClaimTicketWorkFlowService claimTicketWorkFlowService, UserService userService, TemplateMasterRepository templateMasterRepository, ClaimTicketMapper claimTicketMapper, MailService mailService, MessageSource messageSource, ClaimTicketActivityLogService claimTicketActivityLogService, ClaimTicketStatusLogRepository claimTicketStatusLogRepository, EnumUtil enumUtil, AuditLogService auditLogService, NotificationService notificationService, TemplateVariableMappingService templateVariableMappingService) {
        this.claimTicketWorkFlowRepository = claimTicketWorkFlowRepository;
        this.claimTicketRepository = claimTicketRepository;
        this.claimTicketWorkFlowMapper = claimTicketWorkFlowMapper;
        this.claimTicketWorkFlowService = claimTicketWorkFlowService;
        this.userService = userService;
        this.templateMasterRepository = templateMasterRepository;
        this.claimTicketMapper = claimTicketMapper;
        this.mailService = mailService;
        this.messageSource = messageSource;
        this.claimTicketActivityLogService = claimTicketActivityLogService;
        this.claimTicketStatusLogRepository = claimTicketStatusLogRepository;
        this.enumUtil = enumUtil;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
        this.templateVariableMappingService = templateVariableMappingService;
        this.gson = new GsonBuilder()
            .registerTypeAdapter(Instant.class, new InstantTypeAdapter())
            .create();
    }

    /**
     * Cron job to process SLA workflows daily at midnight.
     * ┌───────────── second (0-59)
     * │ ┌───────────── minute (0-59)
     * │ │ ┌───────────── hour (0-23)
     * │ │ │ ┌───────────── day of month (1-31)
     * │ │ │ │ ┌───────────── month (1-12 or JAN-DEC)
     * │ │ │ │ │ ┌───────────── day of week (0-7 or SUN-SAT, 7 is SUN)
     * │ │ │ │ │ │
     * │ │ │ │ │ │
     * * * * * * *
     * "0 0 12 * * ?" - Runs daily at noon.
     * "0 0 0 1 * ?" - Runs at midnight on the first day of every month.
     */
    //@Scheduled(cron = "0 * * * * ?") //run every minutes testing
    @Scheduled(cron = "0 0 0 * * ?")
    public void runSLACronJob() {
        processSLAWorkflows();
    }

    /**
     * Processes SLA workflows for all claim tickets.
     * It checks for any SLA reminders or breaches and triggers the necessary actions.
     */
    public void processSLAWorkflows() {
        // Get current date
        LocalDate today = LocalDate.now();

        // Fetch workflows for SLA reminders or breaches
        List<ClaimTicketWorkFlow> slaWorkflows = claimTicketWorkFlowRepository.findByEventInAndStatusTrue(
            List.of(TicketWorkflowEventEnum.SLA_DAYS_REMINDER, TicketWorkflowEventEnum.SLA_BREACH)
        );

        // Group workflows by organization for easy lookup
        Map<Long, List<ClaimTicketWorkFlow>> workflowsByOrg = slaWorkflows.stream()
            .collect(Collectors.groupingBy(ClaimTicketWorkFlow::getOrganizationId));

        // Fetch all tickets that are active
        List<ClaimTicketStatusEnum> excludedStatuses = Arrays.asList(ClaimTicketStatusEnum.CLOSED, ClaimTicketStatusEnum.REJECTED);
        List<ClaimTicketDTO> tickets = this.getClaimTicketDTOS(excludedStatuses);

        for (ClaimTicketDTO ticket : tickets) {
            Long organizationId = ticket.getOrganizationId();
            List<ClaimTicketWorkFlowDTO> orgWorkflows = workflowsByOrg.getOrDefault(organizationId, Collections.emptyList())
                .stream()
                .map(claimTicketWorkFlowMapper::mapEntityToDTO)
                .toList();
            if (!orgWorkflows.isEmpty()) {
                // Process organization-specific workflows
                for (ClaimTicketWorkFlowDTO workflow : orgWorkflows) {
                    processWorkflowForTicket(workflow, ticket, today);
                }
            } else {
                // Fallback to default SLA check
                processDefaultSLA(ticket, today);
                processDefaultSLABreach(ticket, today);
            }
        }
    }

    /**
     * Retrieves claim ticket DTOs excluding specific statuses.
     *
     * @param excludedStatuses List of claim ticket statuses to exclude.
     * @return List of claim ticket DTOs.
     */
    @Transactional
    public List<ClaimTicketDTO> getClaimTicketDTOS(List<ClaimTicketStatusEnum> excludedStatuses) {
        List<ClaimTicketDTO> claimTicketDTO = new ArrayList<>();
        List<ClaimTicket> claimList = claimTicketRepository.findAllByStatusNotInAndSlaBreachDateIsNotNull(excludedStatuses);
        if(!claimList.isEmpty()){
            for(ClaimTicket claimTicket : claimList){
                claimTicketDTO.add(claimTicketMapper.toDTO(claimTicket));
            }
        }
        return claimTicketDTO;
    }

    /**
     * Processes a workflow for a specific ticket and triggers appropriate actions based on the SLA.
     *
     * @param workflow The workflow to be processed.
     * @param ticket The ticket associated with the workflow.
     * @param today The current date to check against SLA dates.
     */
    private void processWorkflowForTicket(ClaimTicketWorkFlowDTO workflow, ClaimTicketDTO ticket, LocalDate today) {
        LocalDate slaBreachDate = ticket.getSlaBreachDate();

        if (workflow.getEvent() == TicketWorkflowEventEnum.SLA_DAYS_REMINDER) {
            List<SLADaysReminderCondition> conditions = workflow.getSlaDaysReminderConditions();
            for (SLADaysReminderCondition condition : conditions) {
                LocalDate reminderDate = slaBreachDate.minusDays(condition.getNoOfDays());
                if (today.equals(reminderDate)) {
                    triggerSlaReminderActions(workflow, ticket);
                }
            }
        }

        if (workflow.getEvent() == TicketWorkflowEventEnum.SLA_BREACH && today.isAfter(slaBreachDate)) {
            this.closedTicket(ticket, workflow);
            triggerSlaBreachActions(workflow, ticket.getId());
            this.sendSLABreachNotification(ticket.getId());
        }

    }

    private void processDefaultSLA(ClaimTicketDTO ticket, LocalDate today) {
        LOG.info("No workflow default reminder for SLA");
        LocalDate slaBreachDate = ticket.getSlaBreachDate();
        if (slaBreachDate != null) {
            // Calculate dates 2, 3, and 5 days before the SLA breach date
            LocalDate twoDaysBefore = slaBreachDate.minusDays(2);
            LocalDate threeDaysBefore = slaBreachDate.minusDays(3);
            LocalDate fiveDaysBefore = slaBreachDate.minusDays(5);

            LOG.debug("Two days before SLA: {}", twoDaysBefore);
            LOG.debug("Three days before SLA: {}", threeDaysBefore);
            LOG.debug("Five days before SLA: {}", fiveDaysBefore);

            // Check for matching dates and trigger corresponding actions
            if (today.equals(slaBreachDate)) {
                LOG.info("SLA breach today for ticket: {}", ticket);
                this.defaultReminderMailSent(ticket);
            } else if (today.equals(twoDaysBefore)) {
                LOG.info("2 days before SLA breach for ticket: {}", ticket);
                this.defaultReminderMailSent(ticket);
            } else if (today.equals(threeDaysBefore)) {
                LOG.info("3 days before SLA breach for ticket: {}", ticket);
                this.defaultReminderMailSent(ticket);
            } else if (today.equals(fiveDaysBefore)) {
                LOG.info("5 days before SLA breach for ticket: {}", ticket);
                this.defaultReminderMailSent(ticket);
            }
        } else {
            LOG.warn("SLA breach date is null for ticket: {}", ticket);
        }
    }

    private void processDefaultSLABreach(ClaimTicketDTO ticket, LocalDate today) {
        LOG.info("No workflow default Breach for SLA");
        LocalDate slaBreachDate = ticket.getSlaBreachDate();
        if (today.isAfter(slaBreachDate)) {
            this.closedTicket(ticket, null);
            this.sendDefaultSlaBreachMail(ticket.getId());
            this.sendSLABreachNotification(ticket.getId());
        }
    }

    private void sendDefaultSlaBreachMail(Long claimTicketId) {
        ClaimTicketDTO claimTicketDTO = claimTicketRepository.findById(claimTicketId).map(claimTicketMapper::toDTO).orElse(null);
        if(claimTicketDTO != null) {
            if(claimTicketDTO.getInstanceType().equals(InstanceTypeEnum.FIRST_INSTANCE)){
                List<User> fiAdmin = userService.getUserListByRoleSlug(claimTicketDTO.getOrganizationId(), Constants.RIGHTS_FI_ADMIN);
                // Send email to FI Admin
                if (!fiAdmin.isEmpty()) {
                    fiAdmin.forEach(fiAdminUser -> mailService.sendSLABreachedToFIEmail(claimTicketDTO, fiAdminUser));
                }
                this.sendBreachMailToAdmin(claimTicketDTO, claimTicketDTO.getFiAgentId(), UserTypeEnum.FI_USER);
            }else {
                List<User> sepsAdmin = userService.getUserListByRoleSlug(Constants.RIGHTS_SEPS_ADMIN);
                // Send email to SEPS Admin
                if (!sepsAdmin.isEmpty()) {
                    sepsAdmin.forEach(sepsAdminUser -> mailService.sendSLABreachedToSEPSEmail(claimTicketDTO, sepsAdminUser));
                }
                this.sendBreachMailToAdmin(claimTicketDTO, claimTicketDTO.getSepsAgentId(), UserTypeEnum.SEPS_USER);
            }
        }
    }

    private void sendBreachMailToAdmin(ClaimTicketDTO ticket, Long userId, UserTypeEnum userType){
        if(userId != null) {
            User user = userService.findActiveUser(userId);
            if (userType.equals(UserTypeEnum.FI_USER)) {
                if (user != null)
                    mailService.sendSLABreachedToFIEmail(ticket, user);
            } else {
                if (user != null)
                    mailService.sendSLABreachedToSEPSEmail(ticket, user);
            }
        }
    }

    private void sendSLABreachNotification(Long ticketId){

        ClaimTicket cTicket = claimTicketRepository.findById(ticketId)
            .orElse(null);
        if (cTicket== null) {
            return;
        }
        if(cTicket.getInstanceType().equals(InstanceTypeEnum.FIRST_INSTANCE)){
            List<User> fiAdmin = userService.getUserListByRoleSlug(cTicket.getOrganizationId(), Constants.RIGHTS_FI_ADMIN);
            // Send email to FI Admin
            if (!fiAdmin.isEmpty()) {
                fiAdmin.forEach(fiAdminUser -> {
                    Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(cTicket, fiAdminUser);
                    notificationService.sendNotification("SLA_BREACH_ADMIN_NOTIFICATION", variables.get(Constants.ADMIN_TICKET_URL_TEXT), List.of(fiAdminUser.getId()), variables);
                });
            }
            if(cTicket.getFiAgentId()!=null){
                User fiAgent = userService.getUserById(cTicket.getFiAgentId());
                Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(cTicket, fiAgent);
                notificationService.sendNotification("SLA_BREACH_AGENT_NOTIFICATION", variables.get(Constants.ADMIN_TICKET_URL_TEXT), List.of(fiAgent.getId()), variables);
            }
        }else {
            List<User> sepsAdmin = userService.getUserListByRoleSlug(Constants.RIGHTS_SEPS_ADMIN);
            // Send email to SEPS Admin
            if (!sepsAdmin.isEmpty()) {
                sepsAdmin.forEach(sepsAdminUser -> {
                    Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(cTicket, sepsAdminUser);
                    notificationService.sendNotification("SLA_BREACH_ADMIN_NOTIFICATION", variables.get(Constants.ADMIN_TICKET_URL_TEXT), List.of(sepsAdminUser.getId()), variables);
                });
            }
            if(cTicket.getSepsAgentId()!=null){
                User sepsAgent = userService.getUserById(cTicket.getSepsAgentId());
                Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(cTicket, sepsAgent);
                notificationService.sendNotification("SLA_BREACH_AGENT_NOTIFICATION", variables.get(Constants.ADMIN_TICKET_URL_TEXT), List.of(sepsAgent.getId()), variables);
            }
        }
        if(cTicket.getUserId()!=null){
            User customer = userService.getUserById(cTicket.getUserId());
            Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(cTicket, customer);
            notificationService.sendNotification("SLA_BREACH_CUSTOMER_NOTIFICATION", variables.get(Constants.CUSTOMER_TICKET_URL_TEXT), List.of(customer.getId()), variables);
        }
    }

    private void closedTicket(ClaimTicketDTO claimTicketDTO, ClaimTicketWorkFlowDTO claimTicketWorkFlowDTO){
        ClaimTicket ticket = claimTicketRepository.findById(claimTicketDTO.getId()).orElse(null);

        if(ticket!=null) {
            Map<String, Object> oldData = convertEntityToMap(claimTicketDTO);
            String reasonCloseTicket = messageSource.getMessage("claim.ticket.closed.due.to.sla.breach", null, Locale.forLanguageTag(Constants.DEFAULT_LANGUAGE));
            ClaimTicketActivityLog activityLog = createClosedClaimActivityLog(ticket, reasonCloseTicket);
            ticket.setStatus(ClaimTicketStatusEnum.CLOSED);
            ticket.setClosedStatus(ClosedStatusEnum.CLOSE_WITH_EXPIRED);
            ticket.setSlaPopup(null);
            ticket.setStatusComment(reasonCloseTicket);

            // Save the updated ticket
            ClaimTicket savedTicket = claimTicketRepository.save(ticket);
            claimTicketActivityLogService.saveActivityLog(activityLog);

            //Save ClaimTicketStatusLog table
            ClaimTicketStatusLog claimTicketStatusLog = new ClaimTicketStatusLog();
            claimTicketStatusLog.setTicketId(ticket.getId());
            claimTicketStatusLog.setStatus(ClaimTicketStatusEnum.CLOSED);
            claimTicketStatusLog.setSubStatus(ClosedStatusEnum.CLOSE_WITH_EXPIRED.ordinal());
            claimTicketStatusLog.setCreatedBy(SYSTEM_ADMIN);
            claimTicketStatusLog.setInstanceType(ticket.getInstanceType());
            if(claimTicketWorkFlowDTO != null){
                claimTicketStatusLog.setClaimTicketWorkFlowId(claimTicketWorkFlowDTO.getId());
                claimTicketStatusLog.setClaimTicketWorkFlowData(gson.toJson(claimTicketWorkFlowDTO));
            }
            claimTicketStatusLogRepository.save(claimTicketStatusLog);

            Map<String, String> auditMessageMap = new HashMap<>();
            Arrays.stream(LanguageEnum.values()).forEach(language -> {
                String messageAudit = messageSource.getMessage("audit.log.ticket.closed.by.system",
                    new Object[]{Constants.SYSTEM, String.valueOf(ticket.getTicketId()), enumUtil.getLocalizedEnumValue(ClosedStatusEnum.CLOSE_WITH_EXPIRED, Locale.forLanguageTag(language.getCode()))}, Locale.forLanguageTag(language.getCode()));
                auditMessageMap.put(language.getCode(), messageAudit);
            });

            Map<String, Object> entityData = new HashMap<>();
            Map<String, Object> newData = convertEntityToMap(claimTicketMapper.toDTO(savedTicket));
            entityData.put(Constants.OLD_DATA, oldData);
            entityData.put(Constants.NEW_DATA, newData);
            Map<String, Object> req = new HashMap<>();
            req.put("closeSubStatus", ClosedStatusEnum.CLOSE_WITH_EXPIRED.name());
            req.put("reason", reasonCloseTicket);
            String requestBody = gson.toJson(req);
            RequestInfo requestInfo = RequestInfo.createForCronJob();
            auditLogService.logActivity(null, SYSTEM_ADMIN, requestInfo, "closedClaimTicket", ActionTypeEnum.CLAIM_TICKET_CLOSED.name(), savedTicket.getId(), ClaimTicket.class.getSimpleName(),
                null, auditMessageMap, entityData, ActivityTypeEnum.MODIFICATION.name(), requestBody);
        }
    }

    private ClaimTicketActivityLog createClosedClaimActivityLog(ClaimTicket ticket, String reasonCloseTicket) {
        ClaimTicketActivityLog activityLog = new ClaimTicketActivityLog();
        activityLog.setTicketId(ticket.getId());
        activityLog.setPerformedBy(SYSTEM_ADMIN);
        Map<String, String> activityTitle = new HashMap<>();
        Map<String, String> linkedUser = new HashMap<>();
        Map<String, Object> activityDetail = new HashMap<>();
        Map<String, String> subStatus = new HashMap<>();
        activityLog.setActivityType(ClaimTicketActivityEnum.CLOSED.name());
        Arrays.stream(LanguageEnum.values()).forEach(language -> {
            String messageAudit = messageSource.getMessage("ticket.activity.log.ticket.closed",
                new Object[]{Constants.SYSTEM}, Locale.forLanguageTag(language.getCode()));
            activityTitle.put(language.getCode(), messageAudit);
            subStatus.put(language.getCode(), enumUtil.getLocalizedEnumValue(ClosedStatusEnum.CLOSE_WITH_EXPIRED, Locale.forLanguageTag(language.getCode())));
        });
        activityDetail.put("subStatus", subStatus);
        activityDetail.put(Constants.PERFORM_BY, Constants.SYSTEM);
        activityDetail.put(Constants.TICKET_ID, ticket.getTicketId().toString());
        activityDetail.put("text", reasonCloseTicket);
        activityLog.setActivityTitle(activityTitle);
        activityLog.setLinkedUsers(linkedUser);
        activityLog.setActivityDetails(activityDetail);
        return activityLog;
    }

    private void defaultReminderMailSent(ClaimTicketDTO ticket){
        if(ticket.getInstanceType().equals(InstanceTypeEnum.FIRST_INSTANCE)){
            List<User> fiAdmin = userService.getUserListByRoleSlug(ticket.getOrganizationId(), Constants.RIGHTS_FI_ADMIN);
            // Send email to FI Admin
            if (!fiAdmin.isEmpty()) {
                fiAdmin.forEach(fiAdminUser -> {
                    mailService.sendSLAReminderToFIEmail(ticket, fiAdminUser);
                    sendSLAReminderNotification(ticket.getId(), fiAdminUser);
                });
            }
            if (ticket.getFiAgentId() != null) {
                this.sendReminderMailToAdmin(ticket, ticket.getFiAgentId(), UserTypeEnum.FI_USER);
            }
        }else {
            List<User> sepsAdmin = userService.getUserListByRoleSlug(Constants.RIGHTS_SEPS_ADMIN);
            // Send email to SEPS Admin
            if (!sepsAdmin.isEmpty()) {
                sepsAdmin.forEach(sepsAdminUser -> {
                    mailService.sendSLAReminderToSEPSEmail(ticket, sepsAdminUser);
                    sendSLAReminderNotification(ticket.getId(), sepsAdminUser);
                });
            }
            if (ticket.getSepsAgentId() != null) {
                this.sendReminderMailToAdmin(ticket, ticket.getSepsAgentId(), UserTypeEnum.SEPS_USER);
            }
        }
    }

    private void sendReminderMailToAdmin(ClaimTicketDTO ticket, Long userId, UserTypeEnum userType){
        User user = userService.findActiveUser(userId);
        if(userType.equals(UserTypeEnum.FI_USER)){
            if (user != null) {
                mailService.sendSLAReminderToFIEmail(ticket, user);
                sendSLAReminderNotification(ticket.getId(), user);
            }
        }else {
            if (user != null) {
                mailService.sendSLAReminderToSEPSEmail(ticket, user);
                sendSLAReminderNotification(ticket.getId(), user);
            }
        }
    }

    private void sendSLAReminderNotification(Long ticketId, User user){
        if(user!=null) {
            ClaimTicket cTicket = claimTicketRepository.findById(ticketId)
                .orElse(null);
            if (cTicket != null) {
                Map<String, String> variables = templateVariableMappingService.mapNotificationVariables(cTicket, user);
                notificationService.sendNotification("SLA_REMINDER_NOTIFICATION", variables.get(Constants.ADMIN_TICKET_URL_TEXT), List.of(user.getId()), variables);
            }
        }
    }

    private void triggerSlaReminderActions(ClaimTicketWorkFlowDTO claimTicketWorkFlowDTO, ClaimTicketDTO claimTicketDTO) {
        List<SLADaysReminderAction> actions = claimTicketWorkFlowDTO.getSlaDaysReminderActions();
        for (SLADaysReminderAction action : actions) {
            Long agentId = action.getAgentId();
            Long templateId = action.getTemplateId();

            if(templateValidate(templateId, claimTicketWorkFlowDTO.getId(),action.getAction().name()))
                continue;

            User user = null;
            switch (action.getAction()) {
                case MAIL_TO_CUSTOMER:
                    user = findCustomer(claimTicketDTO.getUserId(), claimTicketWorkFlowDTO.getId(),action.getAction().name());
                    break;
                case MAIL_TO_FI_TEAM:
                    user = findAgent(agentId, claimTicketWorkFlowDTO, action.getAction().name(), UserTypeEnum.FI_USER);
                    break;
                case MAIL_TO_FI_AGENT:
                    user = findAgent(claimTicketDTO.getFiAgentId(), claimTicketWorkFlowDTO, action.getAction().name(), UserTypeEnum.FI_USER);
                    sendSLAReminderNotification(claimTicketDTO.getId(),user);
                    break;
                case MAIL_TO_SEPS_TEAM:
                    user = findAgent(agentId, claimTicketWorkFlowDTO, action.getAction().name(), UserTypeEnum.SEPS_USER);
                    break;
                case MAIL_TO_SEPS_AGENT:
                    user = findAgent(claimTicketDTO.getSepsAgentId(), claimTicketWorkFlowDTO, action.getAction().name(), UserTypeEnum.SEPS_USER);
                    sendSLAReminderNotification(claimTicketDTO.getId(),user);
                    break;
                // Add other cases if needed
                default:
                    // Handle unsupported actions or log them
                    break;
            }
            mailService.workflowEmailSend(templateId, claimTicketDTO, user);
        }
    }

    private void triggerSlaBreachActions(ClaimTicketWorkFlowDTO claimTicketWorkFlowDTO, Long claimTicketId) {
        ClaimTicketDTO claimTicketDTO = claimTicketRepository.findById(claimTicketId).map(claimTicketMapper::toDTO).orElse(null);
        if(claimTicketDTO != null) {
            List<SLABreachAction> actions = claimTicketWorkFlowDTO.getSlaBreachActions();
            for (SLABreachAction action : actions) {
                Long agentId = action.getAgentId();
                Long templateId = action.getTemplateId();

                if (templateValidate(templateId, claimTicketWorkFlowDTO.getId(), action.getAction().name()))
                    continue;

                User user = null;
                switch (action.getAction()) {
                    case MAIL_TO_CUSTOMER:
                        user = findCustomer(claimTicketDTO.getUserId(), claimTicketWorkFlowDTO.getId(), action.getAction().name());
                        break;
                    case MAIL_TO_FI_TEAM:
                        user = findAgent(agentId, claimTicketWorkFlowDTO, action.getAction().name(), UserTypeEnum.FI_USER);
                        break;
                    case MAIL_TO_FI_AGENT:
                        user = findAgent(claimTicketDTO.getFiAgentId(), claimTicketWorkFlowDTO, action.getAction().name(), UserTypeEnum.FI_USER);
                        break;
                    case MAIL_TO_SEPS_TEAM:
                        user = findAgent(agentId, claimTicketWorkFlowDTO, action.getAction().name(), UserTypeEnum.SEPS_USER);
                        break;
                    case MAIL_TO_SEPS_AGENT:
                        user = findAgent(claimTicketDTO.getSepsAgentId(), claimTicketWorkFlowDTO, action.getAction().name(), UserTypeEnum.SEPS_USER);
                        break;
                    // Add other cases if needed
                    default:
                        // Handle unsupported actions or log them
                        break;
                }
                mailService.workflowEmailSend(templateId, claimTicketDTO, user);
            }
        }
    }

    /**
     * Finds the customer user associated with the claim ticket.
     *
     * @param customerId        the ID of the customer user.
     * @param workflowId    the ID of the workflow being processed.
     * @param action    the name of the action being performed.
     * @return the {@link User} representing the customer, or {@code null} if not found.
     */
    private User findCustomer(Long customerId, Long workflowId, String action){
        User user = null;
        if (customerId == null) {
            claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.customer.id.null",
                new Object[]{action}, null, null);
        }else {
            user = userService.findUserById(customerId);
            if (user == null) {
                claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.customer.not.found",
                    new Object[]{customerId}, customerId, null);
            }
        }
        return user;
    }

    /**
     * Finds an agent user based on the given agent ID, workflow, and user type.
     *
     * @param agentId       the ID of the agent.
     * @param claimTicketWorkFlowDTO   the DTO of the workflow being processed.
     * @param action    the name of the action being performed.
     * @param userType      the type of user to find (e.g., FI_USER, SEPS_USER).
     * @return the {@link User} representing the agent, or {@code null} if not found.
     */
    private User findAgent(Long agentId, ClaimTicketWorkFlowDTO claimTicketWorkFlowDTO, String action, UserTypeEnum userType){
        User user = null;
        if (agentId == null) {
            claimTicketWorkFlowService.logWorkflowFailure(claimTicketWorkFlowDTO.getId(), "workflow.agent.id.null", new Object[]{action}, null, null);
        }else{
            user = userType.equals(UserTypeEnum.FI_USER) ? claimTicketWorkFlowService.findFIUserForMailAction(agentId, claimTicketWorkFlowDTO) :
                claimTicketWorkFlowService.findSEPSUserForMailAction(agentId, claimTicketWorkFlowDTO);
            if (user == null) {
                claimTicketWorkFlowService.logWorkflowFailure(claimTicketWorkFlowDTO.getId(), "workflow.user.not.found", new Object[]{agentId}, agentId, null);
            }
        }
        return user;
    }

    /**
     * Validates if the template is applicable for the given workflow action.
     *
     * @param templateId        the ID of the email template to validate.
     * @param workflowId        the ID of the workflow to validate against.
     * @param action        the name of the workflow action.
     * @return {@code true} if the template is valid for the action; {@code false} otherwise.
     */
    private boolean templateValidate(Long templateId, Long workflowId, String action){
        boolean result = true;
        if (templateId != null) {
            TemplateMaster templateMaster = templateMasterRepository.findByIdAndStatus(templateId, true).orElse(null);
            if (templateMaster == null) {
                claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.template.not.found",
                    new Object[]{templateId}, null, templateId);
            } else {
                result = false;
            }
        } else {
            claimTicketWorkFlowService.logWorkflowFailure(workflowId, "workflow.template.id.null",
                new Object[]{action}, null, null);
        }
        return result;
    }

    @Scheduled(cron = "0 0 * * * ?") // Runs every hour
    public void processSlaPopupFlags() {
        List<ClaimTicket> claimTickets = claimTicketRepository.findEligibleTicketsForSlaPopup(ClaimTicketStatusEnum.CLOSED, ClaimTicketStatusEnum.REJECTED);

        for (ClaimTicket claimTicket : claimTickets) {
            LocalDate slaBreachDate = claimTicket.getSlaBreachDate();
            LocalDate twoDaysBefore = slaBreachDate.minusDays(Constants.SLA_POPUP_OPEN_DAYS);

            if (claimTicket.getSlaComment() == null && claimTicket.getSlaPopup() == null &&
                (twoDaysBefore.isBefore(LocalDate.now()) || twoDaysBefore.equals(LocalDate.now()))) {
                claimTicket.setSlaPopup(true);
                claimTicketRepository.save(claimTicket);
            }
        }
    }

}
