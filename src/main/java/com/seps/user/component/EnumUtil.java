package com.seps.user.component;

import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * A utility component for handling enum localization in the application.
 * This class provides a method to convert an enum type that implements
 * {@link EnumWithDescription} into a localized map representation.
 * <p>
 * It uses Spring's {@link MessageSource} to fetch localized messages based
 * on the current locale, making it easy to support multiple languages.
 */
@Component
public class EnumUtil {

    private final MessageSource messageSource;

    /**
     * Constructs an {@code EnumUtil} with the specified {@link MessageSource}.
     *
     * @param messageSource the {@link MessageSource} used for retrieving localized messages
     */
    public EnumUtil(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    /**
     * Converts an enum type that implements {@link EnumWithDescription}
     * into a map where the keys are the enum constant names and the values
     * are the localized descriptions.
     * <p>
     * The localization is based on the provided {@link Locale}.
     *
     * @param <E>        the type of the enum, which must extend {@link Enum} and implement {@link EnumWithDescription}
     * @param enumClass  the {@link Class} object of the enum type
     * @param locale     the {@link Locale} to be used for fetching localized descriptions
     * @return a {@link Map} where the keys are enum constant names and the values are localized descriptions
     */
    public <E extends Enum<E> & EnumWithDescription> Map<String, String> enumToLocalizedMap(Class<E> enumClass, Locale locale) {
        return Stream.of(enumClass.getEnumConstants())
            .sorted(Comparator.comparing(Enum::ordinal)) // Sort by enum name
            .collect(Collectors.toMap(
                Enum::name,
                e -> messageSource.getMessage(e.getDescription(), null, locale),
                (existing, replacement) -> existing, // Merge function for duplicate keys
                LinkedHashMap::new // Preserve order
            ));
    }
}
