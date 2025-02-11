package com.seps.admin.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Data
@Entity
@Table(name = "city")
public class CityEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "province_id", insertable = false, updatable = false)
    private ProvinceEntity province;

    @Column(name = "province_id", nullable = false)
    private Long provinceId;

    @Column(name = "status", nullable = false)
    private Boolean status;

    @Column(name = "poverty_range_start")
    private Double povertyRangeStart;

    @Column(name = "poverty_range_end")
    private Double povertyRangeEnd;

    @Column(name = "rurality_range_start")
    private Double ruralityRangeStart;

    @Column(name = "rurality_range_end")
    private Double ruralityRangeEnd;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
