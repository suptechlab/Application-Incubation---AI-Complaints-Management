package com.seps.ticket.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;

/**
 * A TempDocument.
 */
@Entity
@Table(name = "temp_document")
@Data
public class TempDocument implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "external_document_id", nullable = false)
    private String externalDocumentId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "original_title", nullable = false)
    private String originalTitle;

    @Column(name = "uploaded_by")
    private Long uploadedBy;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private Instant uploadedAt;


}
