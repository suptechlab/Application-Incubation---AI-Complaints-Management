package com.seps.ticket.constraint.validation;

import com.seps.ticket.component.CommonHelper;
import com.seps.ticket.component.FileHelper;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class MultipleFilesValidator implements ConstraintValidator<MultipleFilesCondition, List<MultipartFile>> {

    @Autowired
    private CommonHelper commonHelper;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private FileHelper fileHelper;

    private Set<String> validMimeTypes;

    private double validFileSize;

    @Override
    public void initialize(MultipleFilesCondition constraintAnnotation) {
        validMimeTypes = Arrays.stream(fileHelper.getValidMimeType(constraintAnnotation.name())).collect(Collectors.toSet());
        validFileSize = fileHelper.getValidFileSize(constraintAnnotation.name());
    }

    @Override
    public boolean isValid(List<MultipartFile> valueList, ConstraintValidatorContext context) {
        boolean result = true;
        if (valueList != null && valueList.size() > 0) {
            List<String> invalidMimeTypeFileNames = new ArrayList<>();
            List<String> invalidFileSizeFileNames = new ArrayList<>();
            List<String> nullFileNames = new ArrayList<>();

            for (MultipartFile value : valueList) {
                String contentType = value.getContentType();
                Double sizeInKB = commonHelper.bytesToKB(value.getSize());
                String originalFileName = value.getOriginalFilename();
                if (originalFileName == null) {
                    nullFileNames.add("File with null name");
                } else {
                    String fileName = originalFileName.replace(" ", "_");
                    if (!validMimeTypes.contains(contentType)) {
                        invalidMimeTypeFileNames.add(fileName);
                    } else if (sizeInKB > validFileSize) {
                        invalidFileSizeFileNames.add(fileName);
                    }
                }
            }

            if (!nullFileNames.isEmpty()) {
                context.disableDefaultConstraintViolation();
                String msgNullFileNames = messageSource.getMessage("multiple.files.null.name.validation.error", new Object[]{String.join(",", nullFileNames)}, LocaleContextHolder.getLocale());
                context.buildConstraintViolationWithTemplate(msgNullFileNames).addConstraintViolation();
                result = false;
            } else if (!invalidMimeTypeFileNames.isEmpty() && !invalidFileSizeFileNames.isEmpty()) {
                context.disableDefaultConstraintViolation();
                String msgMimeType = messageSource.getMessage("multiple.files.mime.type.validation.error", new Object[]{String.join(",", invalidMimeTypeFileNames), String.join(",", validMimeTypes)}, LocaleContextHolder.getLocale());
                String msgFileSize = messageSource.getMessage("multiple.files.size.validation.error", new Object[]{String.join(",", invalidFileSizeFileNames), validFileSize}, LocaleContextHolder.getLocale());
                context.buildConstraintViolationWithTemplate(msgMimeType + " & " + msgFileSize).addConstraintViolation();
                result = false;
            } else if (!invalidMimeTypeFileNames.isEmpty()) {
                context.disableDefaultConstraintViolation();
                String msgMimeType = messageSource.getMessage("multiple.files.mime.type.validation.error", new Object[]{String.join(",", invalidMimeTypeFileNames), String.join(",", validMimeTypes)}, LocaleContextHolder.getLocale());
                context.buildConstraintViolationWithTemplate(msgMimeType).addConstraintViolation();
                result = false;
            } else if (!invalidFileSizeFileNames.isEmpty()) {
                context.disableDefaultConstraintViolation();
                String msgFileSize = messageSource.getMessage("multiple.files.size.validation.error", new Object[]{String.join(",", invalidFileSizeFileNames), validFileSize}, LocaleContextHolder.getLocale());
                // String msg = "File size must be less than " + validFileSize + "KB";
                context.buildConstraintViolationWithTemplate(msgFileSize).addConstraintViolation();
                result = false;
            }
        }
        return result;
    }

}
