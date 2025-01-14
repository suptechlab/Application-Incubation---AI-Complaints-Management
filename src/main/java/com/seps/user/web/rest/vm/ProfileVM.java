package com.seps.user.web.rest.vm;

import com.seps.user.component.FileHelper;
import com.seps.user.constraint.validation.FileCondition;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ProfileVM {

    @FileCondition(
        name = FileHelper.FileType.PROFILE_PICTURE,
        message = "{claim.ticket.validation.files.invalid.types}" // Message from the language file
    )
    private MultipartFile profilePicture;

    @Size(max = 5)
    private String countryCode;

    @Size(max = 15)
    private String phoneNumber;

}
