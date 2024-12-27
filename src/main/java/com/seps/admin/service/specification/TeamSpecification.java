package com.seps.admin.service.specification;

import com.seps.admin.domain.Team;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class TeamSpecification {
    private TeamSpecification() {
    }

    public static Specification<Team> byFilter(String search, Boolean status) {
        return (root, query, criteriaBuilder) -> {
            // Create a list to hold all predicates (conditions)
            List<Predicate> predicates = new ArrayList<>();

            // Filter by search (name or description)
            if (StringUtils.hasText(search)) {
                predicates.add(
                    criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("teamName")), "%" + search.toLowerCase() + "%"),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), "%" + search.toLowerCase() + "%")
                    )
                );
            }

            // Filter by status (if provided)
            if (status != null) {
                predicates.add(
                    criteriaBuilder.equal(root.get("status"), status)
                );
            }

            // Combine all predicates with 'and'
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Team> byFilterWorkflow(Long organizationId) {
        return (root, query, criteriaBuilder) -> {
            // Create a list to hold all predicates (conditions)
            List<Predicate> predicates = new ArrayList<>();
            if(organizationId!=null) {
                predicates.add(criteriaBuilder.equal(root.get("entityId"), organizationId));
            }else{
                predicates.add(criteriaBuilder.isNull(root.get("entityId")));
            }
            // Filter by status (if provided)
            predicates.add(criteriaBuilder.equal(root.get("status"), true));

            // Combine all predicates with 'and'
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
