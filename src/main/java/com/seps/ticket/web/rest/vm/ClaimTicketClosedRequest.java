package com.seps.ticket.web.rest.vm;

import com.seps.ticket.component.FileHelper;
import com.seps.ticket.constraint.validation.MultipleFilesCondition;
import com.seps.ticket.enums.ClosedStatusEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.ToString;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Data
@ToString
public class ClaimTicketClosedRequest {
    private ClosedStatusEnum closeSubStatus;
    @NotBlank
    private String reason;

    private Double claimAmount;

    @MultipleFilesCondition(
        name = FileHelper.FileType.CLAIM_TICKET_DOCUMENTS,
        message = "{claim.ticket.validation.files.invalid.types}" // Message from the language file
    )
    @Size(max = 1, message = "{claim.ticket.validation.files.max.size}") // Message from the language file
    private List<MultipartFile> attachments = new ArrayList<>();
}
