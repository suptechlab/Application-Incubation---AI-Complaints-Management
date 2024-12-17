package com.seps.ticket.service.specification;

import com.seps.ticket.domain.ClaimTicket;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import com.seps.ticket.web.rest.vm.ClaimTicketFilterRequest;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
import org.zalando.problem.Status;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

public class ClaimTicketSpecification {
    private ClaimTicketSpecification() {
    }

    public static Specification<ClaimTicket> byFilter(Integer year, Long userId) {
        return (root, query, criteriaBuilder) -> {
            // Create a list to hold all predicates (conditions)
            List<Predicate> predicates = new ArrayList<>();
            // Filter by year (if provided)
            if (year != null) {
                // Calculate the start date of the given year
                LocalDateTime startOfYear = LocalDateTime.of(year, 1, 1, 0, 0, 0, 0);
                Instant startDate = startOfYear.toInstant(ZoneOffset.UTC);
                // Calculate the end date of the given year
                LocalDateTime endOfYear = LocalDateTime.of(year, 12, 31, 23, 59, 59, 999999999);
                Instant endDate = endOfYear.toInstant(ZoneOffset.UTC);
                // Add predicate to filter by createdAt between the start and end of the year
                predicates.add(
                        criteriaBuilder.between(root.get("createdAt"), startDate, endDate)
                );

            }

            // Filter by status (if provided)
            if (userId != null) {
                predicates.add(
                        criteriaBuilder.equal(root.get("userId"), userId)
                );
            }

            // Combine all predicates with 'and'
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<ClaimTicket> bySepsFiFilter(ClaimTicketFilterRequest filterRequest, Long fiAgentId, Long sepsAgentId) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Add filters based on the available criteria
            addSearchFilter(filterRequest, root, criteriaBuilder, predicates);
            addOrganizationFilter(filterRequest, root, criteriaBuilder, predicates);
            addStatusFilter(filterRequest, root, criteriaBuilder, predicates);
            addPriorityFilter(filterRequest, root, criteriaBuilder, predicates);
            addAgentFilter(fiAgentId, root, criteriaBuilder, predicates);
            addClaimTypeFilter(filterRequest, root, criteriaBuilder, predicates);
            addSepsAgentFilter(sepsAgentId, root, criteriaBuilder, predicates);
            addDateRangeFilter(filterRequest, root, criteriaBuilder, predicates);

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static void addSearchFilter(ClaimTicketFilterRequest filterRequest, Root<ClaimTicket> root, CriteriaBuilder criteriaBuilder, List<Predicate> predicates) {
        if (StringUtils.hasText(filterRequest.getSearch())) {

            // Filter by ticketId with the "#" symbol
            Predicate ticketIdPredicate = criteriaBuilder.like(
                criteriaBuilder.function("CONCAT", String.class, criteriaBuilder.literal("#"), root.get("ticketId")), "%" + filterRequest.getSearch() + "%"
            );

            // Concatenate firstName and lastName, then filter by the concatenated value
            Join<Object, Object> user = root.join("user", JoinType.INNER);
            Predicate userNamePredicate = criteriaBuilder.like(
                criteriaBuilder.lower(
                    criteriaBuilder.concat(
                        criteriaBuilder.concat(user.get("firstName"), criteriaBuilder.literal(" ")),
                        user.get("lastName")
                    )
                ),
                "%" + filterRequest.getSearch().toLowerCase() + "%"
            );

            // Add both predicates as OR conditions
            predicates.add(criteriaBuilder.or(ticketIdPredicate, userNamePredicate));
        }
    }

    private static void addOrganizationFilter(ClaimTicketFilterRequest filterRequest, Root<ClaimTicket> root, CriteriaBuilder criteriaBuilder, List<Predicate> predicates) {
        if (filterRequest.getOrganizationId() != null) {
            predicates.add(criteriaBuilder.equal(root.get("organizationId"), filterRequest.getOrganizationId()));
        }
    }

    private static void addStatusFilter(ClaimTicketFilterRequest filterRequest, Root<ClaimTicket> root, CriteriaBuilder criteriaBuilder, List<Predicate> predicates) {
        if (filterRequest.getClaimTicketStatus() != null) {
            predicates.add(criteriaBuilder.equal(root.get("status"), filterRequest.getClaimTicketStatus()));
        }
    }

    private static void addPriorityFilter(ClaimTicketFilterRequest filterRequest, Root<ClaimTicket> root, CriteriaBuilder criteriaBuilder, List<Predicate> predicates) {
        if (filterRequest.getClaimTicketPriority() != null) {
            predicates.add(criteriaBuilder.equal(root.get("priority"), filterRequest.getClaimTicketPriority()));
        }
    }

    private static void addAgentFilter(Long fiAgentId, Root<ClaimTicket> root, CriteriaBuilder criteriaBuilder, List<Predicate> predicates) {
        if (fiAgentId != null) {
            predicates.add(criteriaBuilder.equal(root.get("fiAgentId"), fiAgentId));
        }
    }

    private static void addClaimTypeFilter(ClaimTicketFilterRequest filterRequest, Root<ClaimTicket> root, CriteriaBuilder criteriaBuilder, List<Predicate> predicates) {
        if (filterRequest.getClaimTypeId() != null) {
            predicates.add(criteriaBuilder.equal(root.get("claimTypeId"), filterRequest.getClaimTypeId()));
        }
    }

    private static void addSepsAgentFilter(Long sepsAgentId, Root<ClaimTicket> root, CriteriaBuilder criteriaBuilder, List<Predicate> predicates) {
        if (sepsAgentId != null) {
            predicates.add(criteriaBuilder.equal(root.get("sepsAgentId"), sepsAgentId));
        }
    }

    private static void addDateRangeFilter(ClaimTicketFilterRequest filterRequest, Root<ClaimTicket> root, CriteriaBuilder criteriaBuilder, List<Predicate> predicates) {
        if (StringUtils.hasText(filterRequest.getStartDate()) && StringUtils.hasText(filterRequest.getEndDate())) {
            try {
                Instant startInstant = parseDateToInstant(filterRequest.getStartDate());
                Instant endInstant = parseDateToInstant(filterRequest.getEndDate(), true);
                predicates.add(criteriaBuilder.between(root.get("createdAt"), startInstant, endInstant));
            } catch (DateTimeParseException e) {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_DATE_FORMAT, null, null);
            }
        }
    }

    private static Instant parseDateToInstant(String dateString) {
        return parseDateToInstant(dateString, false);
    }

    private static Instant parseDateToInstant(String dateString, boolean endOfDay) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate date = LocalDate.parse(dateString, formatter);
        if (endOfDay) {
            return date.atTime(23, 59, 59).toInstant(ZoneOffset.UTC);
        }
        return date.atStartOfDay().toInstant(ZoneOffset.UTC);
    }

}
