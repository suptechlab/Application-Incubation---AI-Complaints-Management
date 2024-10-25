package com.seps.admin.repository;

import com.seps.admin.domain.InquiryTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InquiryTypeRepository extends JpaRepository<InquiryTypeEntity, Long>, JpaSpecificationExecutor<InquiryTypeEntity> {

    Optional<InquiryTypeEntity> findByNameIgnoreCase(String name);

    List<InquiryTypeEntity> findAllByStatus(boolean status);

    Optional<InquiryTypeEntity> findByIdAndStatusTrue(Long inquiryTypeId);
}

