package com.seps.admin.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

//@Data
@Setter
@Getter
public class InquirySubTypeDTO {

    private Long id;

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private Long inquiryTypeId;

    private Boolean status;

}

