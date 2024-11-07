package com.seps.user.repository;

import com.seps.user.domain.InquiryTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryTypeRepository extends JpaRepository<InquiryTypeEntity, Long>, JpaSpecificationExecutor<InquiryTypeEntity> {

    List<InquiryTypeEntity> findAllByStatus(boolean status);

}

