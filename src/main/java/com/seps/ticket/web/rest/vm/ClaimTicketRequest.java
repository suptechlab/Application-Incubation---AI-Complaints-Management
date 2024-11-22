package com.seps.ticket.web.rest.vm;

import com.seps.ticket.enums.CustomerTypeEnum;
import com.seps.ticket.enums.PriorityCareGroupEnum;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.ToString;


@Data
@ToString
public class ClaimTicketRequest {
    @NotBlank
    private String identificacion;//read-only
    @NotBlank
    @Email
    private String email;//read-only
    @NotBlank
    private String name;//read-only
    @NotBlank
    private String gender;//read-only
    @Size(max = 5)
    private String countryCode;
    @Size(max = 15)
    private String phoneNumber;
    @NotNull
    private Long provinceId;
    @NotNull
    private Long cityId;
    @NotNull
    private PriorityCareGroupEnum priorityCareGroup;
    @NotNull
    private CustomerTypeEnum customerType;
    @NotNull
    private Long organizationId;
    @NotNull
    private Long claimTypeId;
    @NotNull
    private Long claimSubTypeId;
    @NotBlank
    @Size(max = 1024)
    private String precedents;
    @NotBlank
    @Size(max = 1024)
    private String specificPetition;
    // Getters and Setters
    private Boolean checkDuplicate = true;
}
