package com.seps.user.repository;

import com.seps.user.domain.InquirySubTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquirySubTypeRepository extends JpaRepository<InquirySubTypeEntity, Long>, JpaSpecificationExecutor<InquirySubTypeEntity> {
    List<InquirySubTypeEntity> findAllByStatusAndInquiryTypeId(boolean status, Long inquiryType);
}

