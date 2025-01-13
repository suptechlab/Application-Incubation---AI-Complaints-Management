package com.seps.admin.component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Map;

public class DateUtil {
    private static final String DAYS_REMAINING = "days remaining";
    private static final String DAYS_OVERDUE = "days overdue";
    private DateUtil() {
    }

    /**
     * Formats a date based on the provided language.
     *
     * @param date     the date to format (LocalDateTime or converted Instant)
     * @param language the language code ("en" for English, "es" for Spanish)
     * @return the formatted date as a string, or an empty string if the date is null
     */
    private static String format(LocalDateTime date, String language) {
        if (date == null) {
            return "";
        }

        String pattern = "MMMM d, yyyy"; // Default pattern for English
        Locale locale = Locale.ENGLISH; // Default locale for English

        if ("es".equalsIgnoreCase(language)) {
            pattern = "d 'de' MMMM 'de' yyyy"; // Spanish format
            locale = Locale.forLanguageTag("es");
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern, locale);
        return date.format(formatter);
    }

    /**
     * Formats a LocalDateTime based on the provided language.
     *
     * @param date     the LocalDateTime to format
     * @param language the language code ("en" for English, "es" for Spanish)
     * @return the formatted date as a string
     */
    public static String formatDate(LocalDateTime date, String language) {
        return format(date, language);
    }

    /**
     * Formats an Instant based on the provided language.
     *
     * @param instant  the Instant to format
     * @param language the language code ("en" for English, "es" for Spanish)
     * @return the formatted date as a string
     */
    public static String formatDate(Instant instant, String language) {
        if (instant == null) {
            return "";
        }

        // Convert Instant to LocalDateTime using the system's default time zone
        LocalDateTime date = LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
        return format(date, language);
    }

    /**
     * Formats a LocalDate based on the provided language.
     *
     * @param date     the LocalDate to format
     * @param language the language code ("en" for English, "es" for Spanish)
     * @return the formatted date as a string
     */
    public static String formatDate(LocalDate date, String language) {
        if (date == null) {
            return "";
        }

        String pattern = "MMMM d, yyyy"; // Default pattern for English
        Locale locale = Locale.ENGLISH; // Default locale for English

        if ("es".equalsIgnoreCase(language)) {
            pattern = "d 'de' MMMM 'de' yyyy"; // Spanish format
            locale = Locale.forLanguageTag("es");
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern, locale);
        return date.format(formatter);
    }

    /**
     * Calculate and return a user-friendly SLA breach date difference in the specified language.
     *
     * @param slaBreachDate The SLA breach date to calculate against.
     * @param languageCode  The language code (e.g., "en" for English, "es" for Spanish).
     * @return A string indicating the number of days remaining or "N/A" if the date is null.
     */
    public static String getSlaBreachStatus(LocalDate slaBreachDate, String languageCode) {
        if (slaBreachDate == null) {
            return translate("N/A", languageCode);
        }

        LocalDate today = LocalDate.now();
        long daysDifference = ChronoUnit.DAYS.between(today, slaBreachDate);

        String messageKey;
        if (daysDifference > 0) {
            messageKey = DAYS_REMAINING;
        } else if (daysDifference == 0) {
            messageKey = DAYS_REMAINING;
        } else {
            messageKey = DAYS_OVERDUE;
        }
        return String.format("%d %s", Math.abs(daysDifference), translate(messageKey, languageCode));
    }

    /**
     * Translate the given message based on the language code.
     *
     * @param message       The message to translate.
     * @param languageCode  The language code (e.g., "en", "es").
     * @return The translated message.
     */
    private static String translate(String message, String languageCode) {
        Map<String, Map<String, String>> translations = Map.of(
            "es", Map.of(
                DAYS_REMAINING, "días restantes",
                DAYS_OVERDUE, "días vencidos",
                "N/A", "No disponible"
            )
        );
        Map<String, String> languageMap = translations.getOrDefault(languageCode.toLowerCase(Locale.ROOT), Map.of());
        return languageMap.getOrDefault(message, message); // Fallback to original message if not translated
    }
}
