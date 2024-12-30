package com.seps.admin.service.specification;

import com.seps.admin.domain.User;
import com.seps.admin.enums.UserStatusEnum;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class UserSpecification {
    private UserSpecification() {

    }

    /**
     * Creates a combined specification for filtering users by search term, status, email, and roles.
     *
     * @param search      the search term to filter by name
     * @param status      the status of the user (e.g., ACTIVE, INACTIVE)
     * @param authorities the list of authorities to filter users by
     * @param roleId
     * @return the combined {@link Specification} with applied filters
     */
    public static Specification<User> byFilter(String search, UserStatusEnum status, List<String> authorities, Long roleId) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            // Filter by search term (e.g., name, email, department) with OR condition
            if (StringUtils.hasText(search)) {
                Predicate namePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("firstName")), "%" + search.toLowerCase() + "%");
                Predicate emailPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), "%" + search.toLowerCase() + "%");
                Predicate departmentPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("department")), "%" + search.toLowerCase() + "%");
                // Combine name, email, and department with OR
                predicates.add(criteriaBuilder.or(namePredicate, emailPredicate, departmentPredicate));
            }
            // Filter by status
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            // Filter by roles
            if (authorities != null && !authorities.isEmpty()) {
                Join<Object, Object> userAuth = root.join("authorities", JoinType.INNER);
                predicates.add(userAuth.get("name").in(authorities));
            }
            if (roleId != null) {
                Join<Object, Object> userRoles = root.join("roles", JoinType.INNER);
                predicates.add(criteriaBuilder.equal(userRoles.get("id"), roleId));
            }
            // Combine all predicates with 'and'
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<User> byFilterWorkFlow(List<String> authorities, Long organizationId) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by roles
            if (authorities != null && !authorities.isEmpty()) {
                Join<Object, Object> userAuth = root.join("authorities", JoinType.INNER);
                predicates.add(userAuth.get("name").in(authorities));
            }

            if (organizationId != null) {
                predicates.add(criteriaBuilder.equal(root.get("organizationId"), organizationId));
            }

            predicates.add(criteriaBuilder.equal(root.get("status"), UserStatusEnum.ACTIVE));
            // Combine all predicates with 'and'
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
