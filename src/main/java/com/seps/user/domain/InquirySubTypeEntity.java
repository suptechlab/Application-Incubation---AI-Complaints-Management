package com.seps.user.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inquiry_sub_type")
@Data
public class InquirySubTypeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 255)
    @Column(name = "name", unique = true, nullable = false)
    private String name;

    @Size(max = 1000)
    @Column(name = "description")
    private String description;


    @Column(name = "inquiry_type_id")
    private Long inquiryTypeId;

    @ManyToOne
    @JoinColumn(name = "inquiry_type_id", insertable = false, updatable = false)
    private InquiryTypeEntity inquiryType;

    @Column(name = "status", nullable = false)
    private Boolean status = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

}
