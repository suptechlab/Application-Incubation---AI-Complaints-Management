package com.seps.user.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "inquiry")
@Data
public class Inquiry implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "sender_id")
    private String senderId;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "inquiry_resolved")
    private Boolean inquiryResolved;

    @Column(name = "inquiry_redirect")
    private Boolean inquiryRedirect;

    @Column(name = "inquiry_channel")
    private String inquiryChannel;

    @Column(name = "ease_of_finding")
    private Integer easeOfFinding;

    @Column(name = "formats_provided")
    private Integer formatsProvided;

    @Column(name = "clarity_response")
    private Integer clarityResponse;

    @Column(name = "attention_time")
    private Integer attentionTime;

    @CreationTimestamp
    @Column(name = "inquiry_date", nullable = false)
    private Instant inquiryDate;

}

