package com.seps.ticket.service;

import com.seps.ticket.config.Constants;
import com.seps.ticket.enums.ContinueTypeEnum;
import com.seps.ticket.enums.StrategyTypeEnum;
import com.seps.ticket.service.dto.NumberingConfig;

import java.util.Map;

/**
 * This class defines a static configuration map for ticket numbering strategies
 * based on ticket prefixes. It eliminates the need to fetch configuration from
 * the database, making it easy to manage and maintain in constant form.
 *
 * <p>Each prefix is associated with a {@link NumberingConfig} that specifies:
 * <ul>
 *   <li>Strategy type: {@link StrategyTypeEnum#INDEPENDENT} or {@link StrategyTypeEnum#SAME}</li>
 *   <li>Continue type: {@link ContinueTypeEnum#RESET} or {@link ContinueTypeEnum#CONTINUE} (only applicable for INDEPENDENT strategy)</li>
 * </ul>
 * </p>
 *
 * <p>Example usage:
 * <pre>
 *     NumberingConfig config = NumberingConstants.getConfig("R-ESFPS");
 *     if (config.getStrategy() == StrategyTypeEnum.SAME) {
 *         // inherit ticket number from reference
 *     }
 * </pre>
 *
 * <p>Prefixes in use:
 * <ul>
 *   <li>{@code R-ESFPS} – First Instance (Independent, resets every year)</li>
 *   <li>{@code R-SEPS} – Second Instance (Same as referenced ticket)</li>
 *   <li>{@code D-SEPS} – Complaint/Denunciation (Same as referenced ticket)</li>
 * </ul>
 */
public class NumberingConstants {

    /**
     * Static map holding the numbering strategy configuration per ticket prefix.
     */
    public static final Map<String, NumberingConfig> CONFIG_MAP = Map.of(
        Constants.FIRST_INSTANCE_PREFIX,
        new NumberingConfig(Constants.FIRST_INSTANCE_PREFIX, StrategyTypeEnum.INDEPENDENT, ContinueTypeEnum.CONTINUE),

        Constants.SECOND_INSTANCE_PREFIX,
        new NumberingConfig(Constants.SECOND_INSTANCE_PREFIX, StrategyTypeEnum.SAME, null),

        Constants.COMPLAINT_INSTANCE_PREFIX,
        new NumberingConfig(Constants.COMPLAINT_INSTANCE_PREFIX, StrategyTypeEnum.SAME, null)
    );

    /**
     * Retrieves the numbering configuration for a given ticket prefix.
     *
     * @param prefix the ticket prefix (e.g., "R-ESFPS", "R-SEPS", "D-SEPS")
     * @return the corresponding {@link NumberingConfig}, or {@code null} if not found
     */
    public static NumberingConfig getConfig(String prefix) {
        return CONFIG_MAP.get(prefix);
    }
}
