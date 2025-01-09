package com.seps.admin.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "persona")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Persona implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "identificacion", nullable = false, unique = true, length = 20)
    private String identificacion;

    @Column(name = "nombre_completo", length = 255)
    private String nombreCompleto;

    @Column(name = "genero", length = 10)
    private String genero;

    @Column(name = "lugar_nacimiento", length = 255)
    private String lugarNacimiento;

    @Column(name = "nacionalidad", length = 255)
    private String nacionalidad;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

}
