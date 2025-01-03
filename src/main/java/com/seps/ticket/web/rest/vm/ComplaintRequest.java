package com.seps.ticket.web.rest.vm;

import com.seps.ticket.component.FileHelper;
import com.seps.ticket.constraint.validation.MultipleFilesCondition;
import com.seps.ticket.enums.ChannelOfEntryEnum;
import com.seps.ticket.enums.SourceEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintRequest {

    @NotNull
    private Long id;

    @NotBlank
    @Size(max = 1024)
    private String precedents;
    @NotBlank

    @Size(max = 1024)
    private String specificPetition;

    @MultipleFilesCondition(
        name = FileHelper.FileType.CLAIM_TICKET_DOCUMENTS,
        message = "{claim.ticket.validation.files.invalid.types}" // Message from the language file
    )
    @Size(max = 3, message = "{claim.ticket.validation.files.max.size}") // Message from the language file
    private List<MultipartFile> attachments = new ArrayList<>();

    private SourceEnum source;

    private ChannelOfEntryEnum channelOfEntry;

    private List<Long> attachmentsIds = new ArrayList<>();

}
