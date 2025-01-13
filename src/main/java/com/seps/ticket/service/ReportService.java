package com.seps.ticket.service;

import com.seps.ticket.component.DateUtil;
import com.seps.ticket.component.EnumUtil;
import com.seps.ticket.config.Constants;
import com.seps.ticket.domain.*;
import com.seps.ticket.enums.excel.header.ExcelHeaderClaimTicketReportEnum;
import com.seps.ticket.repository.*;
import com.seps.ticket.security.AuthoritiesConstants;
import com.seps.ticket.service.dto.*;
import com.seps.ticket.service.mapper.ClaimTicketMapper;
import com.seps.ticket.service.specification.ClaimTicketSpecification;
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

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
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
    @Transactional
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
        row.createCell(ExcelHeaderClaimTicketReportEnum.TICKET_ID.ordinal()).setCellValue(data.getTicketId());
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
        row.createCell(ExcelHeaderClaimTicketReportEnum.COMPLAINT_PRECEDENTS.ordinal()).setCellValue(data.getComplaintPrecedents() != null ? data.getComplaintPrecedents() : "");
        row.createCell(ExcelHeaderClaimTicketReportEnum.COMPLAINT_SPECIFIC_PETITION.ordinal()).setCellValue(data.getComplaintSpecificPetition() != null ? data.getComplaintSpecificPetition() : "");
        row.createCell(ExcelHeaderClaimTicketReportEnum.SOURCE.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getSource(), LocaleContextHolder.getLocale()));
        row.createCell(ExcelHeaderClaimTicketReportEnum.CHANNEL_OF_ENTRY.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getChannelOfEntry(), LocaleContextHolder.getLocale()));
    }

}
