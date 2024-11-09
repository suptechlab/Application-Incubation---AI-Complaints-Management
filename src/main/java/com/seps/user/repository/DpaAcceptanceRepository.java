package com.seps.user.repository;

import com.seps.user.domain.DpaAcceptance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DpaAcceptanceRepository extends JpaRepository<DpaAcceptance, Long> {
}
