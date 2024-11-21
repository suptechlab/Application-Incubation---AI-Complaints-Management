package com.seps.user.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Data
@Entity
@Table(name = "organization")
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ruc", nullable = false, unique = true, length = 20)
    private String ruc;                // RUC

    @Column(name = "razon_social", nullable = false, unique = true, length = 255)
    private String razonSocial;        // Corporate Name

    @Column(name = "nemonico_tipo_organizacion", nullable = false, unique = true, length = 255)
    private String nemonicoTipoOrganizacion; // Mnemonic Type Code

    @Column(name = "tipo_organizacion", nullable = false, unique = true, length = 255)
    private String tipoOrganizacion;   // Type of Organization

    @Column(name = "created_by")
    private Long createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_by")
    private Long updatedBy;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

}
