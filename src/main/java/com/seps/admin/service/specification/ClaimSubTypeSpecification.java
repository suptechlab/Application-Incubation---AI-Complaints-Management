package com.seps.admin.service.specification;

import com.seps.admin.domain.ClaimSubTypeEntity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class ClaimSubTypeSpecification {
    private ClaimSubTypeSpecification() {
    }

    public static Specification<ClaimSubTypeEntity> byFilter(String search, Boolean status) {
        return (root, query, criteriaBuilder) -> {
            // Create a list to hold all predicates (conditions)
            List<Predicate> predicates = new ArrayList<>();

            // Filter by search (name or description)
            if (StringUtils.hasText(search)) {
                predicates.add(
                    criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + search.toLowerCase() + "%"),
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
}
