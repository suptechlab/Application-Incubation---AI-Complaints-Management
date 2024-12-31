package com.seps.ticket.repository;

import com.seps.ticket.domain.ClaimTicketTaggedUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimTicketTaggedUserRepository extends JpaRepository<ClaimTicketTaggedUser, Long> {

    // Custom query to find by ticket ID
    List<ClaimTicketTaggedUser> findByTicketId(Long ticketId);

    // Custom query to find by user ID
    List<ClaimTicketTaggedUser> findByUserId(Long userId);
}
