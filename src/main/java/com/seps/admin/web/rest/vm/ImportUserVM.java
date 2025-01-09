package com.seps.admin.web.rest.vm;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ImportUserVM {

    @NotNull
    private MultipartFile browseFile;
}
