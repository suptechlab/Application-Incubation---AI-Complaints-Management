package com.seps.user.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Data
@Entity
@Table(name = "claim_sub_type")
public class ClaimSubTypeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "description", length = 1000)
    private String description;

    @ManyToOne
    @JoinColumn(name = "claim_type_id", insertable = false, updatable = false)
    private ClaimTypeEntity claimType;

    @Column(name = "claim_type_id", nullable = false)
    private Long claimTypeId;

    @Column(name = "sla_breach_days", nullable = false)
    private Integer slaBreachDays;

    @Column(name = "status", nullable = false)
    private Boolean status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}

