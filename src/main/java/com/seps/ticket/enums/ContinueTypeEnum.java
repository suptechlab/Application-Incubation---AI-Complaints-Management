package com.seps.ticket.enums;

/**
 * Enum representing the strategy for handling ticket number continuation across years.
 *
 * <p>This is used in the ticket numbering system to determine whether the numbering
 * should reset at the beginning of each new year or continue incrementing across years.</p>
 *
 * <ul>
 *   <li>{@code CONTINUE} – Ticket numbers will continue to increment across years without resetting.</li>
 *   <li>{@code RESET} – Ticket numbers will reset to 1 at the beginning of each new year.</li>
 * </ul>
 *
 * <p>Example:</p>
 * <pre>
 *   Year 2024: 0001, 0002, ...
 *   Year 2025:
 *     - CONTINUE: 0003, 0004, ...
 *     - RESET: 0001, 0002, ...
 * </pre>
 */
public enum ContinueTypeEnum {
    /**
     * Ticket numbers continue incrementing across years.
     */
    CONTINUE,

    /**
     * Ticket numbers reset to 1 at the start of a new year.
     */
    RESET
}
