package com.seps.ticket.domain;

import com.seps.ticket.enums.ClaimTicketStatusEnum;
import com.seps.ticket.enums.InstanceTypeEnum;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;

import java.time.Instant;

@Entity
@Table(name = "claim_ticket_status_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimTicketStatusLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    @Column(name = "status", nullable = false)
    private ClaimTicketStatusEnum status;

    @Column(name = "sub_status")
    private Integer subStatus;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Enumerated
    @Column(name = "instance_type")
    private InstanceTypeEnum instanceType;

    @Column(name = "claim_ticket_work_flow_id")
    private Long claimTicketWorkFlowId;

    @Type(JsonType.class)
    @Column(name = "claim_ticket_work_flow_data", columnDefinition = "jsonb")
    private String claimTicketWorkFlowData; // JSON will be stored as a String or a JSON type in DB

    // Getters and Setters
}
