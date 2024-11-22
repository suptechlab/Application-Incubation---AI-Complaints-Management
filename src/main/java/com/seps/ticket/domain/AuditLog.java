package com.seps.ticket.domain;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "audit_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ip_address", nullable = false)
    private String ipAddress;

    @Column(name = "user_id")
    private Long userId;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", insertable = false, updatable = false)
    private User user;

    @Column(name = "logged_by")
    private Long loggedBy;

    @ManyToOne
    @JoinColumn(name = "logged_by", referencedColumnName = "id", insertable = false, updatable = false)
    private User loggedUser;

    @Column(name = "microservice")
    private String microservice;

    @Type(JsonType.class)
    @Column(name = "request", columnDefinition = "jsonb")
    private String request;

    @Type(JsonType.class)
    @Column(name = "request_body", columnDefinition = "jsonb")
    private String requestBody;

    @Column(name = "method")
    private String method;

    @Column(name = "action_type")
    private String actionType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "entity_name")
    private String entityName;

    @Type(JsonType.class)
    @Column(name = "entity_title", columnDefinition = "jsonb")
    private Map<String, String> entityTitle;

    @Type(JsonType.class)
    @Column(name = "entity_data", columnDefinition = "jsonb")
    private Map<String, Object> entityData;

    @Type(JsonType.class)
    @Column(name = "message", columnDefinition = "jsonb")
    private Map<String, String> message;

    @Column(name = "activity_type")
    private String activityType;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;


    // Getters and setters
}
