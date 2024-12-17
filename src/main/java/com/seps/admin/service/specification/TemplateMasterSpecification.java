package com.seps.admin.service.specification;

import com.seps.admin.domain.TemplateMaster;
import com.seps.admin.enums.TemplateTypeEnum;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Specification class for creating dynamic queries for {@link TemplateMaster} entities.
 * This class provides a method to filter {@link TemplateMaster} records based on
 * search criteria, status, and template type.
 */
public class TemplateMasterSpecification {
    /**
     * Private constructor to prevent instantiation of this utility class.
     */
    private TemplateMasterSpecification() {
    }

    /**
     * Creates a specification to filter {@link TemplateMaster} entities based on provided criteria.
     *
     * @param search       a search string to filter by template name (case-insensitive).
     * @param status       the status of the template (active/inactive) to filter by (optional).
     * @param templateType the type of the template, as defined in {@link TemplateTypeEnum} (optional).
     * @return a {@link Specification} of {@link TemplateMaster} that can be used in query methods.
     */
    public static Specification<TemplateMaster> byFilter(String search, Boolean status, TemplateTypeEnum templateType, Long organizationId) {
        return (root, query, criteriaBuilder) -> {
            // Create a list to hold all predicates (conditions)
            List<Predicate> predicates = new ArrayList<>();

            // Filter by search (name or description)
            if (StringUtils.hasText(search)) {
                predicates.add(
                    criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("templateName")), "%" + search.toLowerCase() + "%")
                    )
                );
            }

            // Filter by status (if provided)
            if (status != null) {
                predicates.add(
                    criteriaBuilder.equal(root.get("status"), status)
                );
            }

            // Filter by templateType (if provided)
            if (templateType != null) {
                predicates.add(
                    criteriaBuilder.equal(root.get("templateType"), templateType.toString())
                );
            }

            // Filter by organizationId (if provided)
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
