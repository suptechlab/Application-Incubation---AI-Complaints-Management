package com.seps.ticket.service.specification;

import com.seps.ticket.domain.ClaimTicket;
import com.seps.ticket.enums.ClaimTicketPriorityEnum;
import com.seps.ticket.enums.ClaimTicketStatusEnum;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import jakarta.persistence.criteria.Predicate;
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

    public static Specification<ClaimTicket> byFilter(Integer year) {
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
            // Combine all predicates with 'and'
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<ClaimTicket> bySepsFiFilter(String search, Long organizationId, ClaimTicketStatusEnum claimTicketStatus, ClaimTicketPriorityEnum claimTicketPriority, String startDate, String endDate, Long fiAgentId, Long claimTypeId) {
        return (root, query, criteriaBuilder) -> {
            // Create a list to hold all predicates (conditions)
            List<Predicate> predicates = new ArrayList<>();

            // Filter by search (ticketId)
            if (StringUtils.hasText(search)) {
                predicates.add(
                    criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("ticketId")), "%" + search.toLowerCase() + "%")
                    )
                );
            }

            // Filter by organizationId (if provided)
            if (organizationId != null) {
                predicates.add(
                    criteriaBuilder.equal(root.get("organizationId"), organizationId)
                );
            }

            // Filter by claimTicketStatusEnum (if provided)
            if(claimTicketStatus !=null){
                predicates.add(
                    criteriaBuilder.equal(root.get("status"), claimTicketStatus)
                );
            }

            // Filter by claimTicketPriorityEnum (if provided)
            if(claimTicketPriority !=null){
                predicates.add(
                    criteriaBuilder.equal(root.get("priority"), claimTicketPriority)
                );
            }

            //Filter by agentId (if provided)
            if(fiAgentId !=null){
                predicates.add(
                    criteriaBuilder.equal(root.get("fiAgentId"), fiAgentId)
                );
            }
            //Filter by claimTypeId (if provided)
            if(claimTypeId != null){
                predicates.add(
                    criteriaBuilder.equal(root.get("claimTypeId"), claimTypeId)
                );
            }

            // Parse and apply the date range filter only if both startDate and endDate are provided
            if (StringUtils.hasText(startDate) && StringUtils.hasText(endDate)) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

                try {
                    Instant startInstant = LocalDate.parse(startDate, formatter).atStartOfDay().toInstant(ZoneOffset.UTC);
                    Instant endInstant = LocalDate.parse(endDate, formatter).atTime(23, 59, 59).toInstant(ZoneOffset.UTC);

                    // Add the date range filter
                    predicates.add(criteriaBuilder.between(root.get("createdAt"), startInstant, endInstant));
                } catch (DateTimeParseException e) {
                    // Handle parsing error if necessary
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_DATE_FORMAT, null, null);
                }
            }

            // Combine all predicates with 'and'
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
