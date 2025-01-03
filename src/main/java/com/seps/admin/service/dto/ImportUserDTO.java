package com.seps.admin.service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ImportUserDTO {

    @NotBlank(message = "{validation.identificacion.required}")
    private String identificacion;

    @NotBlank(message = "{validation.email.required}")
    @Email(message = "{validation.email.invalid}")
    @Size(min = 5, max = 200, message = "{validation.email.length}")
    private String email;

    @Size(max = 5, message = "{validation.countryCode.length}")
    private String countryCode;

    @Size(max = 15, message = "{validation.phoneNumber.length}")
    private String phoneNumber;

    @NotBlank(message = "{validation.ruc.required}")
    private String ruc;

    @NotBlank(message = "{validation.role.required}")
    @Pattern(regexp = "ADMIN|AGENT", message = "{validation.role.invalid}")
    private String role;

}
