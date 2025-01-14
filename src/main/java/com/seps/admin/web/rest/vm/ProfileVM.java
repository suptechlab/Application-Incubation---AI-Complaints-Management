package com.seps.admin.web.rest.vm;

import com.seps.admin.component.FileHelper;
import com.seps.admin.constraint.validation.FileCondition;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ProfileVM {

    @NotNull
    @FileCondition(
        name = FileHelper.FileType.PROFILE_PICTURE,
        message = "{profile.picture.validation.files.invalid.types}" // Message from the language file
    )
    private MultipartFile profilePicture;

}
