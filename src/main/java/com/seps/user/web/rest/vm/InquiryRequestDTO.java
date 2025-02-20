package com.seps.user.web.rest.vm;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class InquiryRequestDTO {

    @NotBlank
    private String senderId;

    private String userName;

    private Long userId;

    private Boolean inquiryResolved;

    private Boolean inquiryRedirect;

    @NotBlank
    private String inquiryChannel;

    @Min(1)
    @Max(5)
    private Integer easeOfFinding;

    @Min(1)
    @Max(5)
    private Integer formatsProvided;

    @Min(1)
    @Max(5)
    private Integer clarityResponse;

    @Min(1)
    @Max(5)
    private Integer attentionTime;

}

