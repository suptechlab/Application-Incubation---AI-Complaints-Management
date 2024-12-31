package com.seps.ticket.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "claim_ticket_otp")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ClaimTicketOTP {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Email
    @Size(min = 5, max = 254)
    @Column(name = "email", length = 255)
    private String email;
    @Column(name = "otp_code", length = 6)
    private String otpCode;
    @Column(name = "used")
    private boolean used;
    @Column(name = "expiry_time")
    private Instant expiryTime;
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
