package com.seps.admin.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.TYPE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Documented
@Constraint(validatedBy = EntityIdValidator.class)
@Target({TYPE})
@Retention(RUNTIME)
public @interface ValidEntityId {
    String message() default "Entity ID is required when entity type is FI.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
