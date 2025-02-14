package com.seps.ticket.service;

import com.seps.ticket.component.EnumUtil;
import com.seps.ticket.config.Constants;
import com.seps.ticket.domain.Authority;
import com.seps.ticket.domain.User;
import com.seps.ticket.enums.ClaimTicketStatusEnum;
import com.seps.ticket.enums.ClosedStatusEnum;
import com.seps.ticket.enums.InstanceTypeEnum;
import com.seps.ticket.repository.ClaimTicketRepository;
import com.seps.ticket.security.AuthoritiesConstants;
import com.seps.ticket.service.dto.ClaimStatusCountResponseDTO;
import com.seps.ticket.service.dto.CloseClaimStatusCountResponseDTO;
import com.seps.ticket.service.dto.DashboardDTO;
import com.seps.ticket.service.dto.PieChartDTO;
import com.seps.ticket.service.projection.ClaimStatusCountProjection;
import com.seps.ticket.service.projection.CloseClaimStatusCountProjection;
import com.seps.ticket.service.projection.SlaAdherenceDataProjection;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.zalando.problem.Status;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

/**
 * Service class responsible for managing dashboard-related data, including graphs and tiles.
 * It aggregates claim statuses, closed claim statuses, and SLA adherence data for visualization.
 */
@Service
public class DashboardService {

    private final EnumUtil enumUtil;
    private final UserService userService;
    private final ClaimTicketRepository claimTicketRepository;
    private final MessageSource messageSource;
    private static final List<String> backgroundColors = Arrays.asList(
        "#D93D2A",
        "#75B13B"
    );

    /**
     * Constructor for {@link DashboardService}.
     *
     * @param enumUtil             Utility component for handling enum localization.
     * @param userService          Service to retrieve user details.
     * @param claimTicketRepository Repository for claim ticket operations.
     * @param messageSource        Source for retrieving localized messages.
     */
    public DashboardService(EnumUtil enumUtil, UserService userService, ClaimTicketRepository claimTicketRepository, MessageSource messageSource) {
        this.enumUtil = enumUtil;
        this.userService = userService;
        this.claimTicketRepository = claimTicketRepository;
        this.messageSource = messageSource;
    }

    /**
     * Retrieves aggregated dashboard data, including claim status counts, closed claim status counts,
     * and SLA adherence graphs for a given organization and date range.
     *
     * @param organizationId The ID of the organization to filter data for.
     * @param startDate      The start date for filtering data, in yyyy-MM-dd format.
     * @param endDate        The end date for filtering data, in yyyy-MM-dd format.
     * @return {@link DashboardDTO} containing the aggregated dashboard data.
     * @throws CustomException If the date format is invalid.
     */
    @Transactional
    public DashboardDTO getGraphAndTiles(Long organizationId, String startDate, String endDate) {
        User currentUser = userService.getCurrentUser();

        Instant startInstant = null;
        Instant endInstant = null;
        if (StringUtils.hasText(startDate) && StringUtils.hasText(endDate)) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            try {
                startInstant = LocalDate.parse(startDate, formatter).atStartOfDay().toInstant(ZoneOffset.UTC);
                endInstant = LocalDate.parse(endDate, formatter).atTime(23, 59, 59).toInstant(ZoneOffset.UTC);
                // Add the date range filter
            } catch (DateTimeParseException e) {
                // Handle parsing error if necessary
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_DATE_FORMAT, null, null);
            }
        }
        Long userId = currentUser.getId();
        boolean isSeps = true;
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();

        InstanceTypeEnum instanceType = null;
        // If FI authority, adjust organization ID
        if (authority.contains(AuthoritiesConstants.FI)) {
            organizationId = currentUser.getOrganization().getId();
            isSeps = false;
            if (currentUser.hasRoleSlug(Constants.RIGHTS_FI_ADMIN)) {
                userId = null; // FI Admin sees all claims for the organization
            }
            instanceType =  InstanceTypeEnum.FIRST_INSTANCE;
        } else if (authority.contains(AuthoritiesConstants.SEPS) && currentUser.hasRoleSlug(Constants.RIGHTS_SEPS_ADMIN)) {
            userId = null; // SEPS Admin sees all claims for the organization
        } else if(authority.contains(AuthoritiesConstants.ADMIN)){
            userId = null; // Admin sees all claims for the organization
        }

        DashboardDTO dashboardDTO = new DashboardDTO();
        dashboardDTO.setClaimStatusCount(this.countClaimsByStatusAndTotal(organizationId, startInstant, endInstant, userId, isSeps, instanceType));
        dashboardDTO.setCloseClaimStatusCount(this.countClaimsByClosedStatusAndTotal(organizationId, startInstant, endInstant, userId, isSeps, instanceType));
        dashboardDTO.setSlaAdherenceGraph(this.slaAdherenceGraphSet(organizationId, startInstant, endInstant, userId, isSeps, instanceType));
        dashboardDTO.setAverageResolutionTime(this.getAverageResolutionTime(organizationId, startInstant, endInstant, userId, isSeps, instanceType));
        return dashboardDTO;
    }

    /**
     * Counts claims grouped by their statuses and calculates the total number of claims.
     *
     * @param organizationId The ID of the organization to filter data for.
     * @param startDate      The start date for filtering claims.
     * @param endDate        The end date for filtering claims.
     * @param userId         The ID of the user to filter claims by.
     * @param isSeps         Flag indicating if the user belongs to the SEPS authority.
     * @return {@link ClaimStatusCountResponseDTO} containing counts by status and the total count.
     */
    @Transactional
    public ClaimStatusCountResponseDTO countClaimsByStatusAndTotal(Long organizationId, Instant startDate, Instant endDate, Long userId, boolean isSeps, InstanceTypeEnum instanceType) {

        // Fetch data using the repository method
        List<ClaimStatusCountProjection> projections = claimTicketRepository.countClaimsByFilters(
            userId, organizationId, startDate, endDate, isSeps, instanceType);

        ClaimStatusCountResponseDTO result = new ClaimStatusCountResponseDTO();

        // Map the results to a status-to-count map
        Map<ClaimTicketStatusEnum, Long> countsByStatus = new EnumMap<>(ClaimTicketStatusEnum.class);
        for (ClaimStatusCountProjection projection : projections) {
            countsByStatus.put(projection.getStatus(), projection.getCount());
        }
        // Ensure all statuses are accounted for in the map
        for (ClaimTicketStatusEnum status : ClaimTicketStatusEnum.values()) {
            countsByStatus.putIfAbsent(status, 0L);
        }
        // Calculate the total count of claims
        long totalClaims = countsByStatus.values().stream().mapToLong(Long::longValue).sum();

        // Add data to the result map
        result.setCountsByStatus(countsByStatus);
        result.setTotalClaims(totalClaims);
        return result;
    }

    /**
     * Counts closed claims grouped by their closed statuses and calculates the total number of closed claims.
     *
     * @param organizationId The ID of the organization to filter data for.
     * @param startDate      The start date for filtering closed claims.
     * @param endDate        The end date for filtering closed claims.
     * @param userId         The ID of the user to filter closed claims by.
     * @param isSeps         Flag indicating if the user belongs to the SEPS authority.
     * @return {@link CloseClaimStatusCountResponseDTO} containing counts by closed status and the total count.
     */
    @Transactional
    public CloseClaimStatusCountResponseDTO countClaimsByClosedStatusAndTotal(Long organizationId, Instant startDate, Instant endDate, Long userId, boolean isSeps, InstanceTypeEnum instanceType) {

        // Fetch data using the repository method
        List<CloseClaimStatusCountProjection> projections = claimTicketRepository.countClosedClaimsByFilters(
            userId, organizationId, startDate, endDate, isSeps, ClaimTicketStatusEnum.CLOSED, instanceType);

        CloseClaimStatusCountResponseDTO result = new CloseClaimStatusCountResponseDTO();

        // Calculate the total count of claims
        long totalClaims = projections.stream().mapToLong(CloseClaimStatusCountProjection::getCount).sum();

        // Map the projections directly to a list of CloseClaimSubStatusDTO
        List<CloseClaimStatusCountResponseDTO.CloseClaimSubStatusDTO> subStatusList = Arrays.stream(ClosedStatusEnum.values())
            .map(status -> {
                // Find the count for each status (defaulting to 0 if not found)
                long count = projections.stream()
                    .filter(p -> status.equals(p.getStatus()))
                    .mapToLong(CloseClaimStatusCountProjection::getCount)
                    .findFirst()
                    .orElse(0L);

                CloseClaimStatusCountResponseDTO.CloseClaimSubStatusDTO dto = new CloseClaimStatusCountResponseDTO.CloseClaimSubStatusDTO();
                dto.setClosedStatus(status);
                dto.setTitle(enumUtil.getLocalizedEnumValue(status, LocaleContextHolder.getLocale()));
                dto.setCount(count);
                return dto;
            })
            .toList();

        // Set the countsByStatus and totalClaims in the result
        result.setCountsByStatus(subStatusList);
        result.setTotalClaims(totalClaims);
        return result;
    }

    /**
     * Generates SLA adherence data for claims, including counts for on-time and breached claims.
     *
     * @param organizationId The ID of the organization to filter data for.
     * @param startDate      The start date for filtering SLA adherence data.
     * @param endDate        The end date for filtering SLA adherence data.
     * @param userId         The ID of the user to filter SLA adherence data by.
     * @param isSeps         Flag indicating if the user belongs to the SEPS authority.
     * @return {@link PieChartDTO} containing the SLA adherence data for pie chart visualization.
     */
    @Transactional
    public PieChartDTO slaAdherenceGraphSet(Long organizationId, Instant startDate, Instant endDate, Long userId, boolean isSeps, InstanceTypeEnum instanceType) {

        List<InstanceTypeEnum> instanceTypes = Arrays.asList(InstanceTypeEnum.FIRST_INSTANCE, InstanceTypeEnum.SECOND_INSTANCE, InstanceTypeEnum.COMPLAINT);
        List<InstanceTypeEnum> instanceTypesOne = List.of(InstanceTypeEnum.FIRST_INSTANCE);

        // Fetch data using the repository method
        SlaAdherenceDataProjection projections = claimTicketRepository.getClaimSlaAdherence(
            userId, organizationId, startDate, endDate, isSeps, List.of(ClaimTicketStatusEnum.CLOSED, ClaimTicketStatusEnum.REJECTED), instanceType!=null ? instanceTypesOne: instanceTypes);

        List<String> labels = new ArrayList<>();
        labels.add(messageSource.getMessage("graph.sla.on.time.claims", null, LocaleContextHolder.getLocale()));
        labels.add(messageSource.getMessage("graph.sla.breached.claims", null, LocaleContextHolder.getLocale()));
        List<Long> data = new ArrayList<>();
        data.add(projections.getSlaOnTimeCount() != null ? projections.getSlaOnTimeCount() : 0L);
        data.add(projections.getSlaBreachedCount() != null ? projections.getSlaBreachedCount() : 0L);

        List<PieChartDTO.Dataset> datasets = Collections.singletonList(new PieChartDTO.Dataset(data, backgroundColors, backgroundColors));

        return new PieChartDTO(labels, datasets);
    }

    /**
     * Calculates the average resolution time of claim tickets based on the provided filters.
     *
     * <p>This method retrieves claim ticket data and computes the average resolution time in days.
     * The resolution time is calculated from the start date of the claim (based on the instance type)
     * to the resolved date of the ticket. The calculation dynamically adjusts for different
     * `instance_type` values, considering specific fields such as
     * `second_instance_filed_at`, `complaint_filed_at`, or `created_at`.
     *
     * @param organizationId the ID of the organization to filter claim tickets by.
     *                       If {@code null}, no organization filtering is applied.
     * @param startDate      the start date to filter claim tickets by. Only tickets with a start date
     *                       on or after this value will be included. If {@code null}, no start date filter is applied.
     * @param endDate        the end date to filter claim tickets by. Only tickets with a start date
     *                       on or before this value will be included. If {@code null}, no end date filter is applied.
     * @param userId         the ID of the user to filter claim tickets by. If {@code null}, tickets for all users are included.
     * @param isSeps         a boolean indicating whether to filter by SEPS agents
     *                       ({@code true} for SEPS agents, {@code false} for FI agents).
     * @return the average resolution time in days as a {@link Double}. Returns {@code null} if no tickets match the filters.
     *
     */
    @Transactional
    public Double getAverageResolutionTime(Long organizationId, Instant startDate, Instant endDate, Long userId, boolean isSeps, InstanceTypeEnum instanceType){
        // Fetch data using the repository method
        return claimTicketRepository.getAvgResolutionTime(
            userId, organizationId, startDate, endDate, isSeps, List.of(ClaimTicketStatusEnum.CLOSED, ClaimTicketStatusEnum.REJECTED), instanceType);
    }
}
