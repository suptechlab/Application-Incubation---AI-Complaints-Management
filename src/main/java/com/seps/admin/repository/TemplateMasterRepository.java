package com.seps.admin.repository;

import com.seps.admin.domain.TemplateMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TemplateMasterRepository extends JpaRepository<TemplateMaster, Long> {
    Optional<TemplateMaster> findByTemplateKeyIgnoreCase(String templateKey);
    boolean existsByTemplateNameIgnoreCase(String templateName);
}
