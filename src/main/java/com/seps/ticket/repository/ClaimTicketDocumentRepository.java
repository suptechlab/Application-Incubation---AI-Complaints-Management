package com.seps.ticket.repository;

import com.seps.ticket.domain.ClaimTicketDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClaimTicketDocumentRepository extends JpaRepository<ClaimTicketDocument, Long> {

}
