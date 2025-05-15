package com.seps.ticket.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ticket_sequence")
@Data
public class TicketSequence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String prefix;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "last_number", nullable = false)
    private Long lastNumber = 0L;
}
