package com.seps.ticket.constraint.validation;

import com.seps.ticket.component.FileHelper;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD,ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = {MultipleFilesValidator.class})
public @interface MultipleFilesCondition {

    FileHelper.FileType name();

    String message() default "Invalid file type or size";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    String[] mimeTypes() default {"image/png","image/jpeg","image/jpg"};

    double fileSize() default 1024;
}
