package com.seps.ticket.web.rest.vm;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptJson {

    @JsonProperty("handoff_to")
    private String handoffTo;

    @NotBlank
    private String transcript;
}
