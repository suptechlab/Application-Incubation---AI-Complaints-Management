package com.seps.ticket.repository;

import com.seps.ticket.domain.ClaimTicketOTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClaimTicketOTPRepository extends JpaRepository<ClaimTicketOTP, Long> {

    Optional<ClaimTicketOTP> findByEmail(String email);

    Optional<ClaimTicketOTP> findOneByEmailIgnoreCase(String email);

    void deleteByEmail(String email);
}
