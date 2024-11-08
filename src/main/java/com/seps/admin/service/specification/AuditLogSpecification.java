package com.seps.admin.service.specification;

import com.seps.admin.domain.AuditLog;
import com.seps.admin.domain.User;
import com.seps.admin.enums.ActivityTypeEnum;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
import org.zalando.problem.Status;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

public class AuditLogSpecification {
    private AuditLogSpecification() {
    }

    public static Specification<AuditLog> byFilter(String search, ActivityTypeEnum activityTypeEnum, String startDate, String endDate) {
        return (root, query, criteriaBuilder) -> {
            // Create a list to hold all predicates (conditions)
            List<Predicate> predicates = new ArrayList<>();

            // Filter by search (name or ip address)
            if (StringUtils.hasText(search)) {
                // Join with loggedUser association to access first name and last name fields
                Join<AuditLog, User> loggedUserJoin = root.join("loggedUser", JoinType.LEFT);

                // Concatenate first name and last name, then filter
                Predicate namePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(
                        criteriaBuilder.concat(
                            criteriaBuilder.concat(loggedUserJoin.get("firstName"), " "),
                            loggedUserJoin.get("lastName")
                        )
                    ),
                    "%" + search.toLowerCase() + "%"
                );

                // Add IP address filter
                Predicate ipPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("ipAddress")),
                    "%" + search.toLowerCase() + "%"
                );

                // Combine name and IP address filters with OR condition
                predicates.add(criteriaBuilder.or(namePredicate, ipPredicate));
            }

            // Filter by status (if provided)
            if (activityTypeEnum != null) {
                predicates.add(
                    criteriaBuilder.equal(root.get("activityType"), activityTypeEnum.toString())
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
