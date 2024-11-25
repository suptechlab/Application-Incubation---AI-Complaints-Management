package com.seps.ticket.service.specification;

import com.seps.ticket.domain.ClaimTicket;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
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
}
