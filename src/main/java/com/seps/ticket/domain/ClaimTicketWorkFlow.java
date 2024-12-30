package com.seps.ticket.domain;

import com.fasterxml.jackson.databind.JsonNode;
import com.seps.ticket.enums.InstanceTypeEnum;
import com.seps.ticket.enums.TicketWorkflowEventEnum;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "claim_ticket_work_flow")
@Data
@NoArgsConstructor
@EqualsAndHashCode
public class ClaimTicketWorkFlow {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id", insertable = false, updatable = false)
    private Long organizationId;

    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @Enumerated
    @Column(name = "instance_type", nullable = false)
    private InstanceTypeEnum instanceType;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", nullable = false)
    private String description;

    @Enumerated
    @Column(name = "event", nullable = false)
    private TicketWorkflowEventEnum event;

    @Column(name = "status", nullable = false)
    private Boolean status;

    @Type(JsonType.class)
    @Column(name = "conditions", columnDefinition = "jsonb")
    private String conditions; // JSON will be stored as a String or a JSON type in DB

    @Type(JsonType.class)
    @Column(name = "actions", nullable = false, columnDefinition = "jsonb")
    private String actions; // JSON will be stored as a String or a JSON type in DB

    @Column(name = "created_by", nullable = false, insertable = false, updatable = false)
    private Long createdBy;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdByUser;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_by", nullable = false, insertable = false, updatable = false)
    private Long updatedBy;

    @ManyToOne
    @JoinColumn(name = "updated_by")
    private User updatedByUser;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

}
