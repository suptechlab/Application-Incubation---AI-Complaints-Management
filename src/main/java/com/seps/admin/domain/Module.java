package com.seps.admin.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "modules")
@Data
public class Module {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    @Column(name = "name_es")
    private String nameEs;

    @Column(name = "description_es")
    private String descriptionEs;

    @Column(name = "user_type")
    private String userType;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Permission> permissions = new ArrayList<>();

}
