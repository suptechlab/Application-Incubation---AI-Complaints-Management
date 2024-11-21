package com.seps.ticket.web.rest.vm;

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

    // Getters and Setters
}
