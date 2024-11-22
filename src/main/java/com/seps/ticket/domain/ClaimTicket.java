package com.seps.ticket.domain;

import com.seps.ticket.enums.*;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "claim_ticket")
@Data
@ToString
public class ClaimTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id", nullable = false, unique = true)
    private Long ticketId;

    @Column(name = "user_id", nullable = false, insertable = false, updatable = false)
    private Long userId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "province_id", nullable = false, insertable = false, updatable = false)
    private Long provinceId;

    @ManyToOne
    @JoinColumn(name = "province_id", nullable = false)
    private Province province;

    @Column(name = "city_id", nullable = false, insertable = false, updatable = false)
    private Long cityId;

    @ManyToOne
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @Column(name = "organization_id", nullable = false, insertable = false, updatable = false)
    private Long organizationId;

    @ManyToOne
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "claim_type_id", nullable = false, insertable = false, updatable = false)
    private Long claimTypeId;

    @ManyToOne
    @JoinColumn(name = "claim_type_id", nullable = false)
    private ClaimType claimType;

    @Column(name = "claim_sub_type_id", nullable = false, insertable = false, updatable = false)
    private Long claimSubTypeId;

    @ManyToOne
    @JoinColumn(name = "claim_sub_type_id", nullable = false)
    private ClaimSubType claimSubType;

    @Enumerated
    @Column(name = "priority_care_group", nullable = false)
    private PriorityCareGroupEnum priorityCareGroup;

    @Enumerated
    @Column(name = "customer_type", nullable = false)
    private CustomerTypeEnum customerType;

    @Column(name = "precedents")
    private String precedents;

    @Column(name = "specific_petition")
    private String specificPetition;

    @Enumerated
    @Column(name = "priority", nullable = false)
    private ClaimTicketPriorityEnum priority;

    @Column(name = "sla_breach_date")
    private LocalDate slaBreachDate;

    @Column(name = "sla_breach_days")
    private Integer slaBreachDays;

    @Column(name = "fi_agent_id", nullable = false, insertable = false, updatable = false)
    private Long fiAgentId;

    @ManyToOne
    @JoinColumn(name = "fi_agent_id")
    private User fiAgent;

    @Column(name = "assigned_at")
    private Instant assignedAt;

    @Enumerated
    @Column(name = "status", nullable = false)
    private ClaimTicketStatusEnum status;

    @Column(name = "closed_status")
    private ClosedStatusEnum closedStatus;

    @Column(name = "rejected_status")
    private RejectedStatusEnum rejectedStatus;

    @Column(name = "status_comment")
    private String statusComment;

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
