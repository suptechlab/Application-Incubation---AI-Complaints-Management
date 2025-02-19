package com.seps.ticket.web.rest.vm;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveySubmitRequest {

    @NotBlank
    private String token;
    @NotNull
    private Integer easeOfFindingInfo;
    @NotNull
    private Integer providedFormats;
    @NotNull
    private Integer responseClarity;
    @NotNull
    private Integer attentionTime;
    private String comment;
}
