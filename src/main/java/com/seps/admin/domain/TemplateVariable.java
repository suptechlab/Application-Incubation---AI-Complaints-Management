package com.seps.admin.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "template_variable")
@Data
public class TemplateVariable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String keyword;

    @Column(nullable = false, length = 10)
    private String language;

    @Column(nullable = false)
    private String meaning;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String usage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();


}

