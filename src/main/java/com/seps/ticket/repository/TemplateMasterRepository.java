package com.seps.ticket.repository;

import com.seps.ticket.domain.TemplateMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

/**
 * Repository interface for managing {@link TemplateMaster} entities.
 * Extends {@link JpaRepository} to provide basic CRUD operations and
 * {@link JpaSpecificationExecutor} for advanced query capabilities.
 */
public interface TemplateMasterRepository extends JpaRepository<TemplateMaster, Long>, JpaSpecificationExecutor<TemplateMaster> {
    Optional<TemplateMaster> findByTemplateKeyIgnoreCaseAndStatusAndIsGeneralTrue(String templateKey, boolean status);

    Optional<TemplateMaster> findByIdAndStatus(Long id, boolean status);

    Optional<TemplateMaster> findByTemplateKeyIgnoreCase(String templateKey);
}
