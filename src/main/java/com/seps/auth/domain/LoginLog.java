package com.seps.auth.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "login_log")
public class LoginLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "timestamp")
    private Instant timestamp;

    @Column(name = "status")
    private String status;

    @Column(name = "ip_address")
    private String ipAddress; // New field for IP address

    // Constructors, getters, and setters
    public LoginLog() {
    }

    public LoginLog(Long userId, Instant timestamp, String status, String ipAddress) {
        this.userId = userId;
        this.timestamp = timestamp;
        this.status = status;
        this.ipAddress = ipAddress; // Set IP address
    }

    // Getters and Setters...

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
}
