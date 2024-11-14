package com.seps.admin.repository;

import com.seps.admin.domain.TemplateMaster;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

/**
 * Repository interface for managing {@link TemplateMaster} entities.
 * Extends {@link JpaRepository} to provide basic CRUD operations and
 * {@link JpaSpecificationExecutor} for advanced query capabilities.
 */
public interface TemplateMasterRepository extends JpaRepository<TemplateMaster, Long>, JpaSpecificationExecutor<TemplateMaster> {
    Optional<TemplateMaster> findByTemplateKeyIgnoreCase(String templateKey);
    boolean existsByTemplateNameIgnoreCase(String templateName);

    Optional<TemplateMaster> findByTemplateNameIgnoreCase(@NotBlank String templateName);
}
