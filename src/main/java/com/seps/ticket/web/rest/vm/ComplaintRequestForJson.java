package com.seps.ticket.web.rest.vm;

import com.seps.ticket.component.FileHelper;
import com.seps.ticket.constraint.validation.MultipleFilesCondition;
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
public class ComplaintRequestForJson {
    private Long id;
    private String precedents;
    private String specificPetition;
    private List<String> attachments = new ArrayList<>();
}
