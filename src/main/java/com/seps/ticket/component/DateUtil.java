package com.seps.ticket.component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class DateUtil {
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
}
