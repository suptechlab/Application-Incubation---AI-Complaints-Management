package com.seps.admin.service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ImportSEPSUserDTO {

    @NotBlank(message = "{validation.email.required}")
    @Email(message = "{validation.email.invalid}")
    @Size(min = 5, max = 200, message = "{validation.email.length}")
    private String email;

    @NotBlank(message = "{validation.role.required}")
    @Pattern(regexp = "ADMIN|AGENT", message = "{validation.role.invalid}")
    private String role;


}
