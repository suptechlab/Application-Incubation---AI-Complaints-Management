package com.seps.ticket.service.dto;

import com.seps.ticket.enums.ContinueTypeEnum;
import com.seps.ticket.enums.StrategyTypeEnum;
import lombok.Data;

@Data
public class NumberingConfig {
    private final String prefix;
    private final StrategyTypeEnum strategy;
    private final ContinueTypeEnum continueType; // Only for INDEPENDENT

    public NumberingConfig(String prefix, StrategyTypeEnum strategy, ContinueTypeEnum continueType) {
        this.prefix = prefix;
        this.strategy = strategy;
        this.continueType = continueType;
    }
}
