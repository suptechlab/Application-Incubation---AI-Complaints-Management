package com.seps.ticket.service.specification;

import com.seps.ticket.domain.ClaimTicketWorkFlow;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class ClaimTicketWorkFlowSpecification {

    private ClaimTicketWorkFlowSpecification() {

    }

    public static Specification<ClaimTicketWorkFlow> byFilter(String search, Boolean status, Long organizationId) {
        return (root, query, criteriaBuilder) -> {
            // Create a list to hold all predicates (conditions)
            List<Predicate> predicates = new ArrayList<>();

            // Filter by search (name or description)
            if (StringUtils.hasText(search)) {
                predicates.add(
                    criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), "%" + search.toLowerCase() + "%")
                    )
                );
            }

            // Filter by status (if provided)
            if (status != null) {
                predicates.add(
                    criteriaBuilder.equal(root.get("status"), status)
                );
            }
            //filter by organization id (if provided)
            if (organizationId != null) {
                predicates.add(
                    criteriaBuilder.equal(root.get("organizationId"), organizationId)
                );
            }
            // Combine all predicates with 'and'
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
