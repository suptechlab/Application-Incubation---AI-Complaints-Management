package com.seps.ticket.domain;

import com.seps.ticket.enums.DocumentSourceEnum;
import com.seps.ticket.enums.InstanceTypeEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "claim_ticket_document")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimTicketDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "claim_ticket_id", nullable = false, insertable = false, updatable = false)
    private Long claimTicketId;

    @Column(name = "external_document_id", nullable = false, length = 255)
    private String externalDocumentId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "original_title", nullable = false, length = 255)
    private String originalTitle;

    @Enumerated
    @Column(name = "source", nullable = false)
    private DocumentSourceEnum source;

    @Enumerated
    @Column(name = "instance_type", nullable = true)
    private InstanceTypeEnum instanceType;

    @Column(name = "internal", nullable = false, columnDefinition = "boolean default true")
    private Boolean internal = true;

    @Column(name = "uploaded_by", nullable = false, insertable = false, updatable = false)
    private Long uploadedBy;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private Instant uploadedAt;

    @ManyToOne
    @JoinColumn(name = "claim_ticket_id", referencedColumnName = "id")  // Foreign key reference
    private ClaimTicket claimTicket;  // Link to the ClaimTicket entity


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", referencedColumnName = "id")
    private User uploadedByUser;

}
