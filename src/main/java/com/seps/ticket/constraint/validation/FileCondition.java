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
@Constraint(validatedBy = {FileValidator.class})
public @interface FileCondition {
    FileHelper.FileType name();
    String[] mimeTypes() default {"image/png","image/jpeg","image/jpg"};
    double fileSize() default 1024;
    boolean required() default false;
    String message() default "Invalid File";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
