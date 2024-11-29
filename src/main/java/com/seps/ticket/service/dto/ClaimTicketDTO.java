package com.seps.ticket.service.dto;

import com.seps.ticket.enums.*;
import lombok.Data;
import lombok.ToString;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@ToString
public class ClaimTicketDTO {
    private Long id;
    private Long ticketId;
    private Long userId;
    private UserDTO user;
    private Long provinceId;
    private ProvinceDTO province;
    private Long cityId;
    private CityDTO city;
    private Long organizationId;
    private OrganizationDTO organization;
    private Long claimTypeId;
    private ClaimTypeDTO claimType;
    private Long claimSubTypeId;
    private ClaimSubTypeDTO claimSubType;
    private PriorityCareGroupEnum priorityCareGroup;
    private CustomerTypeEnum customerType;
    private String precedents;
    private String specificPetition;
    private ClaimTicketPriorityEnum priority;
    private LocalDate slaBreachDate;
    private Integer slaBreachDays;
    private Long fiAgentId;
    private FIUserDTO fiAgent;
    private Instant assignedAt;
    private InstanceTypeEnum instanceType;
    private ClaimTicketStatusEnum status;
    private ClosedStatusEnum closedStatus;
    private RejectedStatusEnum rejectedStatus;
    private String statusComment;
    private Instant resolvedOn;
    private Long createdBy;
    private UserDTO createdByUser;
    private Instant createdAt;
    private Long updatedBy;
    private UserDTO updatedByUser;
    private Instant updatedAt;
    // Getters and Setters
    private List<ClaimTicketDocumentDTO> claimTicketDocuments; // Added this line to include documents in DTO
}
