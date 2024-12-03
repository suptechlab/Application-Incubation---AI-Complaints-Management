package com.seps.ticket.domain;

import com.seps.ticket.enums.ClaimTicketPriorityEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "claim_ticket_priority_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimTicketPriorityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    @Column(name = "priority", nullable = false)
    private ClaimTicketPriorityEnum priority;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

}
