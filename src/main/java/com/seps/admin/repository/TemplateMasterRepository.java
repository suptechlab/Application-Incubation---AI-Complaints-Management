package com.seps.admin.repository;

import com.seps.admin.domain.TemplateMaster;
import com.seps.admin.enums.EmailUserTypeEnum;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
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
    Optional<TemplateMaster> findByTemplateKeyIgnoreCaseAndStatus(String templateKey, boolean status);

    List<TemplateMaster> findAllByIsGeneralTrueAndIsStaticFalseAndStatusTrue();

    Optional<TemplateMaster> findByIdAndIsGeneralTrueAndIsStaticFalseAndStatusTrue(Long id);

    boolean existsByTemplateKeyAndIsGeneralAndOrganizationIdAndUserType(
        String templateKey,
        boolean isGeneral,
        Long organizationId,
        EmailUserTypeEnum userType
    );

    Optional<TemplateMaster> findByTemplateKeyAndIsGeneralAndOrganizationIdAndUserType(
        String templateKey,
        boolean isGeneral,
        Long organizationId,
        EmailUserTypeEnum userType
    );

    Optional<TemplateMaster> findByIdAndOrganizationId(Long id, Long organizationId);

    List<TemplateMaster> findAllByStatusTrueAndOrganizationIdIsNullOrOrganizationId(Long organizationId);

    List<TemplateMaster> findAllByStatusTrueAndOrganizationIdIsNull();
}
