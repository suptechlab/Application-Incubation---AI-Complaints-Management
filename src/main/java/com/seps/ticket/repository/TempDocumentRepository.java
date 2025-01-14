package com.seps.ticket.repository;

import com.seps.ticket.domain.TempDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for the TempDocument entity.
 */
@Repository
public interface TempDocumentRepository extends JpaRepository<TempDocument, Long> {
    List<TempDocument> findAllByExternalDocumentIdIn(List<String> attachmentsIds);

    void deleteAllByExternalDocumentIdIn(List<String> externalDocumentIds);
}
