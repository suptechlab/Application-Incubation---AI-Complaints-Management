package com.seps.ticket.domain;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "claim_ticket_work_flow_failure_log")
@Data
@NoArgsConstructor
@EqualsAndHashCode
public class ClaimTicketWorkFlowFailureLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "claim_ticket_work_flow_id")
    private Long claimTicketWorkFlowId;

    @Type(JsonType.class)
    @Column(name = "reason", columnDefinition = "jsonb")
    private Map<String, String> reason; // JSON will be stored as a String or a JSON type in DB

    @Column(name = "agent_id")
    private Long agentId;

    @CreationTimestamp
    @Column(name = "logged_at")
    private LocalDateTime loggedAt;

}
