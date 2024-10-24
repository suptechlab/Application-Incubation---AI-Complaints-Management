package com.seps.admin.repository;

import com.seps.admin.domain.InquiryTypeEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InquiryTypeRepository extends JpaRepository<InquiryTypeEntity, Long> {
    boolean existsByName(String name);

    Optional<InquiryTypeEntity> findByNameIgnoreCase(String name);

    Page<InquiryTypeEntity> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description, Pageable pageable);

    List<InquiryTypeEntity> findAllByStatus(boolean status);

    Optional<InquiryTypeEntity> findByIdAndStatusTrue(Long inquiryTypeId);
}

