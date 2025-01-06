package com.seps.ticket.web.rest.vm;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class ClaimTicketSlaCommentRequest {

    @NotBlank
    @Size(max = 255)
    private String slaComment;

}
