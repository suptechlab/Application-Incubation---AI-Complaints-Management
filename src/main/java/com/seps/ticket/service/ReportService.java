package com.seps.ticket.service;

import com.seps.ticket.component.CommonHelper;
import com.seps.ticket.component.DateUtil;
import com.seps.ticket.component.EnumUtil;
import com.seps.ticket.config.Constants;
import com.seps.ticket.domain.*;
import com.seps.ticket.enums.ClaimTicketStatusEnum;
import com.seps.ticket.enums.SlaComplianceEnum;
import com.seps.ticket.enums.excel.header.ExcelHeaderClaimTicketEnum;
import com.seps.ticket.enums.excel.header.ExcelHeaderClaimTicketReportEnum;
import com.seps.ticket.enums.excel.header.ExcelHeaderSlaComplianceReportEnum;
import com.seps.ticket.repository.*;
import com.seps.ticket.security.AuthoritiesConstants;
import com.seps.ticket.service.dto.*;
import com.seps.ticket.service.mapper.ClaimTicketMapper;
import com.seps.ticket.service.specification.ClaimTicketSpecification;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import com.seps.ticket.web.rest.vm.ClaimTicketFilterRequest;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.zalando.problem.Status;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.NumberFormat;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Service class responsible for generating and managing reports related to claim tickets.
 * Provides functionality to list claim ticket data and export claim overview reports in Excel format.
 */
@Service
public class ReportService {

    private static final Logger LOG = LoggerFactory.getLogger(ReportService.class);

    private final ClaimTicketRepository claimTicketRepository;
    private final UserService userService;
    private final ClaimTicketMapper claimTicketMapper;
    private final EnumUtil enumUtil;

    /**
     * Constructs a new instance of ReportService with the required dependencies.
     *
     * @param claimTicketRepository repository for accessing claim ticket data
     * @param userService           service for retrieving user-related information
     * @param claimTicketMapper     mapper for converting claim ticket entities to DTOs
     * @param enumUtil              utility for localizing enums
     */
    public ReportService(ClaimTicketRepository claimTicketRepository, UserService userService, ClaimTicketMapper claimTicketMapper, EnumUtil enumUtil) {
        this.claimTicketRepository = claimTicketRepository;
        this.userService = userService;
        this.claimTicketMapper = claimTicketMapper;
        this.enumUtil = enumUtil;
    }

    /**
     * Retrieves a paginated list of claim tickets based on the provided filter criteria.
     *
     * @param pageable      pagination information
     * @param filterRequest filter criteria for claim tickets
     * @return a paginated list of claim tickets as {@link ClaimTicketListDTO}
     */
    @Transactional(readOnly = true)
    public Page<ClaimTicketListDTO> listClaimOverview(Pageable pageable, ClaimTicketFilterRequest filterRequest) {
        LOG.debug("View List of Claim Overview");
        // If no filterRequest is provided, initialize a default object
        filterRequest = getClaimTicketFilterRequest(filterRequest);

        return claimTicketRepository.findAll(ClaimTicketSpecification.byClaimReportFilter(filterRequest), pageable)
            .map(claimTicketMapper::toListDTO);
    }

    /**
     * Prepares the {@link ClaimTicketFilterRequest} with default values based on the current user's roles and permissions.
     *
     * @param filterRequest the filter request to prepare, or null to create a default request
     * @return the prepared filter request
     */
    private ClaimTicketFilterRequest getClaimTicketFilterRequest(ClaimTicketFilterRequest filterRequest) {
        if (filterRequest == null) {
            filterRequest = new ClaimTicketFilterRequest();
        }
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream().map(Authority::getName).toList();
        if (authority.contains(AuthoritiesConstants.FI)) {
            filterRequest.setOrganizationId(currentUser.getOrganization().getId());
            if (!currentUser.hasRoleSlug(Constants.RIGHTS_FI_ADMIN)) {
                filterRequest.setFiAgentId(currentUser.getId());
            }
        } else {
            if (authority.contains(AuthoritiesConstants.SEPS) && !currentUser.hasRoleSlug(Constants.RIGHTS_SEPS_ADMIN)) {
                filterRequest.setSepsAgentId(currentUser.getId());
            }
        }
        return filterRequest;
    }

    /**
     * Generates an Excel report containing claim overview data based on the provided filter criteria.
     *
     * @param filterRequest filter criteria for claim tickets
     * @return a {@link ByteArrayInputStream} containing the generated Excel file
     * @throws IOException if an I/O error occurs while creating the report
     */
    @Transactional
    public ByteArrayInputStream getDownloadClaimOverviewData(ClaimTicketFilterRequest filterRequest) throws IOException {
        // If no filterRequest is provided, initialize a default object
        filterRequest = getClaimTicketFilterRequest(filterRequest);

        List<ClaimTicketListDTO> claimAndComplaintsList = claimTicketRepository.findAll(ClaimTicketSpecification.byClaimReportFilter(filterRequest)).stream()
            .map(claimTicketMapper::toListDTO).toList();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Claim Overview");

            // Header
            Row headerRow = sheet.createRow(0);

            for (ExcelHeaderClaimTicketReportEnum header : ExcelHeaderClaimTicketReportEnum.values()) {
                // Use ordinal() to determine the column index
                Cell cell = headerRow.createCell(header.ordinal());
                cell.setCellValue(enumUtil.getLocalizedEnumValue(header, LocaleContextHolder.getLocale()));
            }
            // Populate data rows
            int rowIdx = 1;
            for (ClaimTicketListDTO data : claimAndComplaintsList) {
                Row row = sheet.createRow(rowIdx++);
                createRows(data, row);
            }

            // Auto-size columns
            for (ExcelHeaderClaimTicketReportEnum header : ExcelHeaderClaimTicketReportEnum.values()) {
                sheet.autoSizeColumn(header.ordinal());
            }
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    /**
     * Populates a row in the Excel sheet with data from a {@link ClaimTicketListDTO}.
     *
     * @param data the data to populate
     * @param row  the row to populate
     */
    private void createRows(ClaimTicketListDTO data, Row row) {
        row.createCell(ExcelHeaderClaimTicketReportEnum.ID.ordinal()).setCellValue(data.getId());
        row.createCell(ExcelHeaderClaimTicketReportEnum.TICKET_ID.ordinal()).setCellValue(data.getFormattedTicketId());
        row.createCell(ExcelHeaderClaimTicketReportEnum.CLAIM_TYPE.ordinal()).setCellValue(data.getClaimType().getName());
        row.createCell(ExcelHeaderClaimTicketReportEnum.CLAIM_SUB_TYPE.ordinal()).setCellValue(data.getClaimSubType().getName());
        row.createCell(ExcelHeaderClaimTicketReportEnum.FI_ENTITY.ordinal()).setCellValue(data.getOrganization().getRazonSocial());
        row.createCell(ExcelHeaderClaimTicketReportEnum.SLA_DATE.ordinal()).setCellValue(DateUtil.formatDate(data.getSlaBreachDate(), LocaleContextHolder.getLocale().getLanguage()));
        row.createCell(ExcelHeaderClaimTicketReportEnum.STATUS.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getStatus(), LocaleContextHolder.getLocale()));
        row.createCell(ExcelHeaderClaimTicketReportEnum.CUSTOMER_NAME.ordinal()).setCellValue(data.getUser() != null ? data.getUser().getName() : "");
        row.createCell(ExcelHeaderClaimTicketReportEnum.FI_AGENT.ordinal()).setCellValue(data.getFiAgent() != null ? data.getFiAgent().getName() : "");
        row.createCell(ExcelHeaderClaimTicketReportEnum.SEPS_AGENT.ordinal()).setCellValue(data.getSepsAgent() != null ? data.getSepsAgent().getName() : "");
        row.createCell(ExcelHeaderClaimTicketReportEnum.INSTANCE_TYPE.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getInstanceType(), LocaleContextHolder.getLocale()));
        row.createCell(ExcelHeaderClaimTicketReportEnum.CREATED_AT.ordinal()).setCellValue(DateUtil.formatDate(data.getCreatedAt(), LocaleContextHolder.getLocale().getLanguage()));
        row.createCell(ExcelHeaderClaimTicketReportEnum.PROVINCE.ordinal()).setCellValue(data.getProvince() != null ? data.getProvince().getName() : "");
        row.createCell(ExcelHeaderClaimTicketReportEnum.CITY.ordinal()).setCellValue(data.getCity() != null ? data.getCity().getName() : "");
        row.createCell(ExcelHeaderClaimTicketReportEnum.PRIORITY_CARE_GROUP.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getPriorityCareGroup(), LocaleContextHolder.getLocale()));
        row.createCell(ExcelHeaderClaimTicketReportEnum.CUSTOMER_TYPE.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getCustomerType(), LocaleContextHolder.getLocale()));
        row.createCell(ExcelHeaderClaimTicketReportEnum.PRIORITY.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getPriority(), LocaleContextHolder.getLocale()));
        row.createCell(ExcelHeaderClaimTicketReportEnum.SLA_BREACH_DAYS.ordinal()).setCellValue(data.getSlaBreachDays() != null ? data.getSlaBreachDays().toString() : "");
        row.createCell(ExcelHeaderClaimTicketReportEnum.ASSIGNED_AT.ordinal()).setCellValue(DateUtil.formatDate(data.getAssignedAt(), LocaleContextHolder.getLocale().getLanguage()));
        row.createCell(ExcelHeaderClaimTicketReportEnum.CLOSED_STATUS.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getClosedStatus(), LocaleContextHolder.getLocale()));
        row.createCell(ExcelHeaderClaimTicketReportEnum.REJECTED_STATUS.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getRejectedStatus(), LocaleContextHolder.getLocale()));
        row.createCell(ExcelHeaderClaimTicketReportEnum.RESOLVED_ON.ordinal()).setCellValue(DateUtil.formatDate(data.getResolvedOn(), LocaleContextHolder.getLocale().getLanguage()));
        row.createCell(ExcelHeaderClaimTicketReportEnum.CREATED_BY_USER.ordinal()).setCellValue(data.getCreatedByUser() != null ? data.getCreatedByUser().getName() : "");
        row.createCell(ExcelHeaderClaimTicketReportEnum.SECOND_INSTANCE_COMMENT.ordinal()).setCellValue(data.getSecondInstanceComment() != null ? data.getSecondInstanceComment() : "");
        row.createCell(ExcelHeaderClaimTicketReportEnum.SOURCE.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getSource(), LocaleContextHolder.getLocale()));
        row.createCell(ExcelHeaderClaimTicketReportEnum.CHANNEL_OF_ENTRY.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getChannelOfEntry(), LocaleContextHolder.getLocale()));
        row.createCell(ExcelHeaderClaimTicketReportEnum.CLAIM_AMOUNT.ordinal())
            .setCellValue(CommonHelper.formatAmount(data.getClaimAmount()));
    }


    /**
     * Retrieves a paginated list of SLA compliance data based on the provided filter request.
     *
     * @param pageable      the pagination and sorting information
     * @param filterRequest the filter criteria for fetching SLA compliance data.
     *                      If null, a default filter request is initialized.
     * @return a {@link Page} of {@link SLAComplianceDTO} containing SLA compliance details
     * such as SLA duration, actual resolution time, SLA compliance status, and
     * breach reasons (if applicable).
     *
     * <p>The method performs the following operations:
     * <ul>
     *     <li>Initializes the filter request if it is not provided.</li>
     *     <li>Fetches claim ticket data matching the filter criteria using the repository.</li>
     *     <li>Maps each claim ticket entity to an {@link SLAComplianceDTO}.</li>
     *     <li>Calculates SLA duration and actual resolution time in days.</li>
     *     <li>Determines SLA compliance status based on the calculated duration and resolution time.</li>
     *     <li>Populates the SLA breach reason if the ticket is non-compliant.</li>
     * </ul>
     * <p>
     * Transactional (readOnly=true) ensures the method executes within a read-only transactional context.
     * @see Pageable
     * @see ClaimTicketFilterRequest
     * @see SLAComplianceDTO
     */
    @Transactional(readOnly = true)
    public Page<SLAComplianceDTO> listSlaComplianceData(Pageable pageable, ClaimTicketFilterRequest filterRequest) {
        // If no filterRequest is provided, initialize a default object
        filterRequest = getClaimTicketFilterRequest(filterRequest);
        return claimTicketRepository.findAll(ClaimTicketSpecification.getSlaComplianceReport(filterRequest), pageable)
            .map(claimTicket -> {
                SLAComplianceDTO slaCompliance = claimTicketMapper.toListSlaDTO(claimTicket);

                LocalDate slaBreachDate = slaCompliance.getSlaBreachDate();

                // Convert Instant to LocalDate
                ZoneId zoneId = ZoneId.systemDefault(); // Use system's default time zone
                LocalDate creationDate = slaCompliance.getCreatedAt().atZone(zoneId).toLocalDate();

                long slaDurationInDays = ChronoUnit.DAYS.between(creationDate, slaBreachDate);

                LocalDateTime dateOfCreation = LocalDateTime.ofInstant(slaCompliance.getCreatedAt(), zoneId);
                LocalDateTime dateOfResolution = LocalDateTime.ofInstant(slaCompliance.getResolvedOn() != null ? slaCompliance.getResolvedOn() : slaCompliance.getUpdatedAt(), zoneId);

                // Calculate Actual Resolution Time in days
                Duration duration = Duration.between(dateOfCreation, dateOfResolution);
                long actualResolutionTimeInDays = duration.toDays();

                slaCompliance.setSlaDurationInDays(slaDurationInDays);
                slaCompliance.setActualResolutionDays(actualResolutionTimeInDays);

                if (actualResolutionTimeInDays <= slaDurationInDays) {
                    slaCompliance.setSlaCompliance(enumUtil.getLocalizedEnumValue(SlaComplianceEnum.COMPLIANT, LocaleContextHolder.getLocale()));
                } else {
                    slaCompliance.setSlaCompliance(enumUtil.getLocalizedEnumValue(SlaComplianceEnum.NON_COMPLIANT, LocaleContextHolder.getLocale()));
                    slaCompliance.setSlaBreachReason(claimTicket.getStatusComment()); // Example reason
                }
                return slaCompliance;
            });
    }

    /**
     * Generates and downloads an Excel report of SLA compliance data based on the provided filter criteria.
     *
     * @param filterRequest the filter criteria for fetching SLA compliance data. If null, a default filter request is initialized.
     * @return a {@link ByteArrayInputStream} containing the Excel report data.
     * @throws IOException if an error occurs during Excel file generation.
     *
     *                     <p>The method performs the following operations:
     *                     <ul>
     *                         <li>Initializes the filter request if it is not provided.</li>
     *                         <li>Fetches a list of claim tickets matching the filter criteria using the repository.</li>
     *                         <li>Creates an Excel workbook and sheet, and adds headers based on the {@link ExcelHeaderSlaComplianceReportEnum}.</li>
     *                         <li>Populates rows with SLA compliance data using {@link #createSlaRows(ClaimTicket, Row)}.</li>
     *                         <li>Auto-sizes the columns for better readability.</li>
     *                         <li>Writes the Excel workbook to a {@link ByteArrayOutputStream} and returns it as a {@link ByteArrayInputStream}.</li>
     *                     </ul>
     *                     <p>
     *                     Transactional(readOnly = true) ensures the method executes within a read-only transactional context.
     * @see ClaimTicketFilterRequest
     * @see ExcelHeaderSlaComplianceReportEnum
     */
    @Transactional(readOnly = true)
    public ByteArrayInputStream getDownloadSlaComplianceData(ClaimTicketFilterRequest filterRequest) throws IOException {
        // If no filterRequest is provided, initialize a default object
        filterRequest = getClaimTicketFilterRequest(filterRequest);
        LOG.debug("filterRequest:{}", filterRequest);

        List<ClaimTicket> slaComplianceList = claimTicketRepository.findAll(ClaimTicketSpecification.getSlaComplianceReport(filterRequest)).stream().toList();


        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("SLA Compliance");

            // Header
            Row headerRow = sheet.createRow(0);

            for (ExcelHeaderSlaComplianceReportEnum header : ExcelHeaderSlaComplianceReportEnum.values()) {
                // Use ordinal() to determine the column index
                Cell cell = headerRow.createCell(header.ordinal());
                cell.setCellValue(enumUtil.getLocalizedEnumValue(header, LocaleContextHolder.getLocale()));
            }
            // Populate data rows
            int rowIdx = 1;
            for (ClaimTicket data : slaComplianceList) {
                Row row = sheet.createRow(rowIdx++);
                createSlaRows(data, row);
            }

            // Auto-size columns
            for (ExcelHeaderSlaComplianceReportEnum header : ExcelHeaderSlaComplianceReportEnum.values()) {
                sheet.autoSizeColumn(header.ordinal());
            }
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    /**
     * Populates a row in the SLA compliance Excel sheet with data from a {@link ClaimTicket} entity.
     *
     * @param data the {@link ClaimTicket} containing SLA compliance data.
     * @param row  the Excel {@link Row} to populate with data.
     *
     *             <p>The method performs the following operations:
     *             <ul>
     *                 <li>Sets cell values for fields such as ticket ID, claim type, FI entity, SLA breach date, and status.</li>
     *                 <li>Calculates SLA duration and actual resolution time in days.</li>
     *                 <li>Determines SLA compliance status and populates the SLA breach reason if applicable.</li>
     *             </ul>
     * @see ClaimTicket
     * @see ExcelHeaderSlaComplianceReportEnum
     */
    private void createSlaRows(ClaimTicket data, Row row) {
        row.createCell(ExcelHeaderSlaComplianceReportEnum.ID.ordinal()).setCellValue(data.getId());
        row.createCell(ExcelHeaderSlaComplianceReportEnum.TICKET_ID.ordinal()).setCellValue(data.getFormattedTicketId());
        row.createCell(ExcelHeaderSlaComplianceReportEnum.CLAIM_TYPE.ordinal()).setCellValue(data.getClaimType().getName());
        row.createCell(ExcelHeaderSlaComplianceReportEnum.CLAIM_SUB_TYPE.ordinal()).setCellValue(data.getClaimSubType().getName());
        row.createCell(ExcelHeaderSlaComplianceReportEnum.FI_ENTITY.ordinal()).setCellValue(data.getOrganization().getRazonSocial());
        row.createCell(ExcelHeaderSlaComplianceReportEnum.SLA_DATE.ordinal()).setCellValue(DateUtil.formatDate(data.getSlaBreachDate(), LocaleContextHolder.getLocale().getLanguage()));
        row.createCell(ExcelHeaderSlaComplianceReportEnum.STATUS.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getStatus(), LocaleContextHolder.getLocale()));
        row.createCell(ExcelHeaderSlaComplianceReportEnum.CUSTOMER_NAME.ordinal()).setCellValue(data.getUser() != null ? data.getUser().getFirstName() : "");
        row.createCell(ExcelHeaderSlaComplianceReportEnum.FI_AGENT.ordinal()).setCellValue(data.getFiAgent() != null ? data.getFiAgent().getFirstName() : "");
        row.createCell(ExcelHeaderSlaComplianceReportEnum.SEPS_AGENT.ordinal()).setCellValue(data.getSepsAgent() != null ? data.getSepsAgent().getFirstName() : "");
        row.createCell(ExcelHeaderSlaComplianceReportEnum.INSTANCE_TYPE.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getInstanceType(), LocaleContextHolder.getLocale()));
        row.createCell(ExcelHeaderSlaComplianceReportEnum.CREATED_AT.ordinal()).setCellValue(DateUtil.formatDate(data.getCreatedAt(), LocaleContextHolder.getLocale().getLanguage()));
        row.createCell(ExcelHeaderSlaComplianceReportEnum.PROVINCE.ordinal()).setCellValue(data.getProvince() != null ? data.getProvince().getName() : "");
        row.createCell(ExcelHeaderSlaComplianceReportEnum.CITY.ordinal()).setCellValue(data.getCity() != null ? data.getCity().getName() : "");
        row.createCell(ExcelHeaderSlaComplianceReportEnum.PRIORITY.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getPriority(), LocaleContextHolder.getLocale()));
        row.createCell(ExcelHeaderSlaComplianceReportEnum.SLA_BREACH_DAYS.ordinal()).setCellValue(data.getSlaBreachDays() != null ? data.getSlaBreachDays().toString() : "");
        row.createCell(ExcelHeaderSlaComplianceReportEnum.CLOSED_STATUS.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getClosedStatus(), LocaleContextHolder.getLocale()));
        row.createCell(ExcelHeaderSlaComplianceReportEnum.RESOLVED_ON.ordinal()).setCellValue(DateUtil.formatDate(data.getResolvedOn(), LocaleContextHolder.getLocale().getLanguage()));
        row.createCell(ExcelHeaderSlaComplianceReportEnum.SOURCE.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getSource(), LocaleContextHolder.getLocale()));
        row.createCell(ExcelHeaderSlaComplianceReportEnum.CHANNEL_OF_ENTRY.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getChannelOfEntry(), LocaleContextHolder.getLocale()));

        LocalDate slaBreachDate = data.getSlaBreachDate();
        // Convert Instant to LocalDate
        ZoneId zoneId = ZoneId.systemDefault(); // Use system's default time zone
        LocalDate creationDate = data.getCreatedAt().atZone(zoneId).toLocalDate();
        LOG.debug("id :{} creationDate:{} slaBreachDate:{} ", data.getId(), creationDate, slaBreachDate);
        long slaDurationInDays = ChronoUnit.DAYS.between(creationDate, slaBreachDate);

        LocalDateTime dateOfCreation = LocalDateTime.ofInstant(data.getCreatedAt(), zoneId);
        LocalDateTime dateOfResolution = LocalDateTime.ofInstant(data.getResolvedOn() != null ? data.getResolvedOn() : data.getUpdatedAt(), zoneId);

        // Calculate Actual Resolution Time in days
        Duration duration = Duration.between(dateOfCreation, dateOfResolution);
        long actualResolutionTimeInDays = duration.toDays();

        row.createCell(ExcelHeaderSlaComplianceReportEnum.SLA_DURATION_IN_DAYS.ordinal()).setCellValue(slaDurationInDays);
        row.createCell(ExcelHeaderSlaComplianceReportEnum.ACTUAL_RESOLUTION_DAYS.ordinal()).setCellValue(actualResolutionTimeInDays);
        row.createCell(ExcelHeaderSlaComplianceReportEnum.SLA_BREACH_REASON.ordinal()).setCellValue("");
        if (actualResolutionTimeInDays <= slaDurationInDays) {
            row.createCell(ExcelHeaderSlaComplianceReportEnum.SLA_COMPLIANCE.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(SlaComplianceEnum.COMPLIANT, LocaleContextHolder.getLocale()));
        } else {
            row.createCell(ExcelHeaderSlaComplianceReportEnum.SLA_COMPLIANCE.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(SlaComplianceEnum.NON_COMPLIANT, LocaleContextHolder.getLocale()));
            row.createCell(ExcelHeaderSlaComplianceReportEnum.SLA_BREACH_REASON.ordinal()).setCellValue(data.getStatusComment());
        }
    }

    /**
     * Service class to calculate average resolution time for claim tickets.
     * Retrieves the average resolution time for claim tickets based on the provided filters.
     *
     * @param filterRequest the filter request containing criteria to filter claim tickets.
     *                      If null, a default filter request will be initialized.
     * @return a map containing the average resolution time under the key "averageResolutionTime".
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAverageResolutionTimeData(ClaimTicketFilterRequest filterRequest) {
        // If no filterRequest is provided, initialize a default object
        filterRequest = getClaimTicketFilterRequest(filterRequest);

        List<ClaimTicket> slaComplianceList = claimTicketRepository.findAll(ClaimTicketSpecification.getSlaComplianceReport(filterRequest)).stream().toList();
        Double avgTime = calculateAverageResolutionTime(slaComplianceList);
        Map<String, Object> data = new HashMap<>();
        data.put("averageResolutionTime", avgTime);
        return data;
    }

    /**
     * Calculates the average resolution time for a list of claim tickets.
     *
     * @param slaComplianceList a list of {@link ClaimTicket} objects to calculate resolution time.
     * @return the average resolution time in days as a double value. If the list is empty or contains no resolved tickets,
     * the method returns 0.0.
     */
    public double calculateAverageResolutionTime(List<ClaimTicket> slaComplianceList) {
        if (slaComplianceList == null || slaComplianceList.isEmpty()) {
            return 0.0; // Return 0 if the list is empty
        }

        double totalResolutionTimeInDays = 0.0;
        int resolvedTicketsCount = 0;

        for (ClaimTicket ticket : slaComplianceList) {
            // Ensure resolution date is available
            if (ticket.getResolvedOn() != null && ticket.getCreatedAt() != null) {
                long resolutionTimeInHours = ChronoUnit.HOURS.between(ticket.getCreatedAt(), ticket.getResolvedOn());
                double resolutionTimeInDays = resolutionTimeInHours / 24.0;
                totalResolutionTimeInDays += resolutionTimeInDays;
                resolvedTicketsCount++;
            }
        }

        // Calculate the average resolution time
        return resolvedTicketsCount > 0 ? totalResolutionTimeInDays / resolvedTicketsCount : 0.0;
    }

}
