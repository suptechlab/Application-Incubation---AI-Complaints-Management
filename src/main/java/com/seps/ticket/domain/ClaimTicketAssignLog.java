package com.seps.ticket.domain;

import com.seps.ticket.enums.InstanceTypeEnum;
import com.seps.ticket.enums.UserTypeEnum;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "claim_ticket_assign_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimTicketAssignLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_type", nullable = false)
    private UserTypeEnum userType;

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
