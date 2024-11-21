package com.seps.ticket.repository;

import com.seps.ticket.domain.ClaimType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClaimTypeRepository extends JpaRepository<ClaimType, Long> {

}
