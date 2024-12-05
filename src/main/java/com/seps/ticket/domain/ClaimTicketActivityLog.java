package com.seps.ticket.domain;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "claim_ticket_activity_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClaimTicketActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    @Column(name = "performed_by", nullable = false)
    private Long performedBy;

    @CreationTimestamp
    @Column(name = "performed_at", nullable = false)
    private LocalDateTime performedAt;

    @Column(name = "activity_type", nullable = false, length = 50)
    private String activityType;

    @Type(JsonType.class)
    @Column(name = "activity_title", columnDefinition = "json")
    private Map<String, String> activityTitle;

    @Type(JsonType.class)
    @Column(name = "activity_details", columnDefinition = "json")
    private Map<String, Object> activityDetails;

    @Type(JsonType.class)
    @Column(name = "linked_users", columnDefinition = "json")
    private Map<String, String> linkedUsers;

    @Type(JsonType.class)
    @Column(name = "tagged_users", columnDefinition = "json")
    private Map<String, String> taggedUsers;

    @Type(JsonType.class)
    @Column(name = "attachment_url", columnDefinition = "json")
    private Map<String, Object> attachmentUrl;
}
