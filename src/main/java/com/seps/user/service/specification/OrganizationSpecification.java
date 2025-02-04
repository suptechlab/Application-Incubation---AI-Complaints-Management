package com.seps.user.service.specification;

import com.seps.user.domain.Organization;
import org.springframework.data.jpa.domain.Specification;


public class OrganizationSpecification {

    public static Specification<Organization> hasSearchTerm(String search) {
        return (root, query, criteriaBuilder) -> {
            if (search == null || search.isEmpty()) {
                return criteriaBuilder.conjunction(); // No filtering
            }
            String likePattern = "%" + search.toLowerCase() + "%";
            return criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("razonSocial")), likePattern)
            );
        };
    }
}

