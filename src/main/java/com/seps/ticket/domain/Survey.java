package com.seps.ticket.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "survey")
@Data
public class Survey implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "ticket_id")
    private Long ticketId;

    @Column(name = "token")
    private String token;

    @Column(name = "ease_of_finding_info")
    private Integer easeOfFindingInfo;

    @Column(name = "provided_formats")
    private Integer providedFormats;

    @Column(name = "response_clarity")
    private Integer responseClarity;

    @Column(name = "attention_time")
    private Integer attentionTime;

    @Column(name = "completed")
    private Boolean completed = false;

    @Column(name = "comment")
    private String comment;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "completed_at")
    private Instant completedAt;

}
