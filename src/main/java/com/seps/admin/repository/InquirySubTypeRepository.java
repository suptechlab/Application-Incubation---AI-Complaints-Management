package com.seps.admin.repository;

import com.seps.admin.domain.InquirySubTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InquirySubTypeRepository extends JpaRepository<InquirySubTypeEntity, Long>, JpaSpecificationExecutor<InquirySubTypeEntity> {
    Optional<InquirySubTypeEntity> findByNameIgnoreCase(String name);
//    Page<InquirySubTypeEntity> findByNameContainingIgnoreCaseOrStatus(String name, Boolean status, Pageable pageable);
//
//    Page<InquirySubTypeEntity> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description, Pageable pageable);
}

