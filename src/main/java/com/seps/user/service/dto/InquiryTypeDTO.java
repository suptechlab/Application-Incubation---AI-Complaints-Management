package com.seps.user.service.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import lombok.ToString;


@Data
@ToString
public class InquiryTypeDTO {

    private Long id;

    @NotEmpty
    private String name;

    private String description;

    private Boolean status;


}
