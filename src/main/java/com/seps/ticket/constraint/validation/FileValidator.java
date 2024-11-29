package com.seps.ticket.constraint.validation;

import com.seps.ticket.component.FileHelper;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

public class FileValidator implements ConstraintValidator<FileCondition, MultipartFile> {

    private final Logger log = LoggerFactory.getLogger(FileValidator.class);
    private final FileHelper fileHelper;
    private final MessageSource messageSource;
    private Set<String> validMimeTypes = new HashSet<>();
    private double validFileSize;
    private boolean required;

    public FileValidator(FileHelper fileHelper, MessageSource messageSource) {
        this.fileHelper = fileHelper;
        this.messageSource = messageSource;
    }

    @Override
    public void initialize(FileCondition constraintAnnotation) {
        if (constraintAnnotation.name() != null) {
            validMimeTypes = Arrays.stream(fileHelper.getValidMimeType(constraintAnnotation.name())).collect(Collectors.toSet());
            validFileSize = fileHelper.getValidFileSize(constraintAnnotation.name());
        } else {
            validMimeTypes = Arrays.stream(constraintAnnotation.mimeTypes()).collect(Collectors.toSet());
            validFileSize = constraintAnnotation.fileSize();
        }
        required = constraintAnnotation.required();
    }

    @Override
    public boolean isValid(MultipartFile value, ConstraintValidatorContext context) {
        log.debug("value:{}", value);
        if ((value == null || value.isEmpty()) && required) {
            addConstraintViolation(context, "not.blank");
            return false;
        }
        if (value != null && !value.isEmpty()) {
            String contentType = value.getContentType();
            Double sizeInKB = bytesToKB(value.getSize());
            if (!validMimeTypes.contains(contentType)) {
                addConstraintViolation(context, "file.mime.type.validation.error", String.join(",", validMimeTypes));
                return false;
            }
            if (sizeInKB > validFileSize) {
                addConstraintViolation(context, "file.size.validation.error", validFileSize);
                return false;
            }
        }
        return true;
    }

    private void addConstraintViolation(ConstraintValidatorContext context, String messageKey, Object... messageArgs) {
        context.disableDefaultConstraintViolation();
        String msg = messageSource.getMessage(messageKey, messageArgs, LocaleContextHolder.getLocale());
        context.buildConstraintViolationWithTemplate(msg).addConstraintViolation();
    }

    public static double bytesToKB(double bytes) {
        return (bytes / 1024.0);
    }
}
