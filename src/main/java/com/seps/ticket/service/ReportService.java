package com.seps.ticket.service;

import com.seps.ticket.component.DateUtil;
import com.seps.ticket.component.EnumUtil;
import com.seps.ticket.config.Constants;
import com.seps.ticket.domain.*;
import com.seps.ticket.enums.excel.header.ExcelHeaderClaimTicketEnum;
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

@Service
public class ReportService {

    private static final Logger LOG = LoggerFactory.getLogger(ReportService.class);

    private final ClaimTicketRepository claimTicketRepository;
    private final UserService userService;
    private final ClaimTicketMapper claimTicketMapper;
    private final EnumUtil enumUtil;
    public ReportService(ClaimTicketRepository claimTicketRepository, UserService userService, ClaimTicketMapper claimTicketMapper, EnumUtil enumUtil) {
        this.claimTicketRepository = claimTicketRepository;
        this.userService = userService;
        this.claimTicketMapper = claimTicketMapper;
        this.enumUtil = enumUtil;
    }

    @Transactional
    public Page<ClaimTicketListDTO> listClaimOverview(Pageable pageable, ClaimTicketFilterRequest filterRequest) {
        // If no filterRequest is provided, initialize a default object
        filterRequest = getClaimTicketFilterRequest(filterRequest);

        return claimTicketRepository.findAll(ClaimTicketSpecification.byClaimReportFilter(filterRequest), pageable)
            .map(claimTicketMapper::toListDTO);
    }

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
            // Data
            int rowIdx = 1;
            for (ClaimTicketListDTO data : claimAndComplaintsList) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(ExcelHeaderClaimTicketReportEnum.ID.ordinal()).setCellValue(data.getId());
                row.createCell(ExcelHeaderClaimTicketReportEnum.TICKET_ID.ordinal()).setCellValue(data.getTicketId());
                row.createCell(ExcelHeaderClaimTicketReportEnum.CLAIM_TYPE.ordinal()).setCellValue(data.getClaimType().getName());
                row.createCell(ExcelHeaderClaimTicketReportEnum.CLAIM_SUB_TYPE.ordinal()).setCellValue(data.getClaimSubType().getName());
                row.createCell(ExcelHeaderClaimTicketReportEnum.FI_ENTITY.ordinal()).setCellValue(data.getOrganization().getRazonSocial());
                row.createCell(ExcelHeaderClaimTicketReportEnum.SLA_DATE.ordinal()).setCellValue(DateUtil.formatDate(data.getSlaBreachDate(), LocaleContextHolder.getLocale().getLanguage()));
                row.createCell(ExcelHeaderClaimTicketReportEnum.STATUS.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getStatus(), LocaleContextHolder.getLocale()));
                row.createCell(ExcelHeaderClaimTicketReportEnum.CUSTOMER_NAME.ordinal()).setCellValue(data.getUser() !=null ? data.getUser().getName():"");
                row.createCell(ExcelHeaderClaimTicketReportEnum.FI_AGENT.ordinal()).setCellValue(data.getFiAgent() != null ? data.getFiAgent().getName():"");
                row.createCell(ExcelHeaderClaimTicketReportEnum.SEPS_AGENT.ordinal()).setCellValue(data.getSepsAgent() != null ? data.getSepsAgent().getName():"");
                row.createCell(ExcelHeaderClaimTicketReportEnum.INSTANCE_TYPE.ordinal()).setCellValue(enumUtil.getLocalizedEnumValue(data.getInstanceType(), LocaleContextHolder.getLocale()));
                row.createCell(ExcelHeaderClaimTicketReportEnum.CREATED_AT.ordinal()).setCellValue(DateUtil.formatDate(data.getCreatedAt(), LocaleContextHolder.getLocale().getLanguage()));
                row.createCell(ExcelHeaderClaimTicketReportEnum.SECOND_INSTANCE_CREATED_AT.ordinal()).setCellValue(DateUtil.formatDate(data.getSecondInstanceFiledAt(), LocaleContextHolder.getLocale().getLanguage()));
                row.createCell(ExcelHeaderClaimTicketReportEnum.COMPLAINT_CREATED_AT.ordinal()).setCellValue(DateUtil.formatDate(data.getComplaintFiledAt(), LocaleContextHolder.getLocale().getLanguage()));

            }
            // Auto-size columns
            for (ExcelHeaderClaimTicketReportEnum header : ExcelHeaderClaimTicketReportEnum.values()) {
                sheet.autoSizeColumn(header.ordinal());
            }
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}
