package com.seps.admin.service.specification;

import com.seps.admin.domain.Role;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class RoleSpecification {
    private RoleSpecification(){
    }
    public static Specification<Role> byFilter(String search, Boolean status) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by search (if search is not null or empty)
            if (search != null && !search.trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")),
                    "%" + search.toLowerCase() + "%"
                ));
            }

            // Filter by status (if status is provided)
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            predicates.add(criteriaBuilder.equal(root.get("deleted"), false));
            // Combine predicates with AND logic
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}

