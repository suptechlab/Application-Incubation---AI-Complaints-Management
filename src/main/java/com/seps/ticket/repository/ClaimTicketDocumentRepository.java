package com.seps.ticket.repository;

import com.seps.ticket.domain.ClaimTicketDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimTicketDocumentRepository extends JpaRepository<ClaimTicketDocument, Long> {

    List<ClaimTicketDocument> findAllByClaimTicketIdAndInternal(Long id, boolean b);

    List<ClaimTicketDocument> findAllByClaimTicketId(Long id);
}
