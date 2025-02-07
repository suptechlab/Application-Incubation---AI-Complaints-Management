package com.seps.user.repository;

import com.seps.user.domain.TemplateMaster;
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
}
