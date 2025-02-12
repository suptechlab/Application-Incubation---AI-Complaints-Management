package com.seps.admin.repository;

import com.seps.admin.domain.TemplateVariable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TemplateVariableRepository extends JpaRepository<TemplateVariable, Long> {
    Optional<TemplateVariable> findByKeyword(String keyword);

    List<TemplateVariable> findAllByLanguage(String language);
}
