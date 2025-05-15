package com.seps.ticket.enums;

/**
 * Enum representing the strategy type used for generating ticket numbers
 * in the system.
 *
 * <p>This enum defines how the ticket number should be generated based on the
 * relationship between instances (First, Second, Third, etc.).</p>
 *
 * <ul>
 *   <li>{@code INDEPENDENT} – Each instance maintains its own independent ticket numbering,
 *       incrementing by 1 according to the configuration.</li>
 *   <li>{@code SAME} – The ticket number will be the same as the reference ticket from a related instance
 *       (e.g., a Second Instance ticket referencing a First Instance ticket will inherit its number).</li>
 * </ul>
 *
 * <p>Example:</p>
 * <pre>
 *   - INDEPENDENT:
 *       R-SEPS-2025-001-000000000000001
 *       R-SEPS-2025-001-000000000000002
 *
 *   - SAME:
 *       First Instance: R-ESFPS-2025-001-000000000000101
 *       Second Instance: R-SEPS-2025-001-000000000000101 (same number with a different alpha code)
 * </pre>
 */
public enum StrategyTypeEnum {
    /**
     * Independent numbering strategy where each ticket gets a unique incremental number.
     */
    INDEPENDENT,

    /**
     * Same-number strategy where the ticket inherits the number from its reference ticket.
     */
    SAME
}
