package com.seps.admin.domain;

import com.seps.admin.enums.EmailUserTypeEnum;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "template_master")
@Data
public class TemplateMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "template_key", nullable = false, unique = true)
    private String templateKey;

    @Column(name = "template_name", nullable = false)
    private String templateName;

    @Column(name = "template_type", nullable = false)
    private String templateType;

    @Column(name = "subject")
    private String subject;

    @Column(name = "content")
    private String content;

    @Column(name = "supported_variables")
    private String supportedVariables;

    @Column(name = "status", nullable = false)
    private Boolean status = true;

    @Column(name = "created_by")
    private Long createdBy;

    @ManyToOne
    @JoinColumn(name = "created_by", referencedColumnName = "id", insertable = false, updatable = false)
    private User userCreatedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_by")
    private Long updatedBy;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "is_general")
    private Boolean isGeneral;

    @Column(name = "organization_id")
    private Long organizationId;

    @Column(name = "user_type")
    private EmailUserTypeEnum userType;

    @Column(name = "is_static")
    private Boolean isStatic;
}
