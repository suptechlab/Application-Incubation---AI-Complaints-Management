package com.seps.ticket.service;

import com.seps.ticket.domain.TicketSequence;
import com.seps.ticket.enums.ContinueTypeEnum;
import com.seps.ticket.enums.StrategyTypeEnum;
import com.seps.ticket.repository.TicketSequenceRepository;
import com.seps.ticket.service.dto.NumberingConfig;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.List;

/**
 * Service responsible for generating ticket numbers based on
 * configurable strategies (INDEPENDENT or SAME) and continuation behavior
 * (RESET every year or CONTINUE across years).
 *
 * <p>This class works in conjunction with {@link TicketSequenceRepository}
 * to persist and lock the current sequence number to ensure unique ticket numbers
 * in concurrent environments.</p>
 *
 * <p>Supported strategies:
 * <ul>
 *   <li>{@link StrategyTypeEnum#INDEPENDENT} – Generates a new incrementing number</li>
 *   <li>{@link StrategyTypeEnum#SAME} – Uses the reference ticket number (shared across instances)</li>
 * </ul>
 *
 * <p>Continuation types:
 * <ul>
 *   <li>{@link ContinueTypeEnum#RESET} – Resets counter every new year</li>
 *   <li>{@link ContinueTypeEnum#CONTINUE} – Continues the sequence across years</li>
 * </ul>
 */
@Service
public class TicketNumberService {

    private final TicketSequenceRepository ticketSequenceRepository;

    public TicketNumberService(TicketSequenceRepository ticketSequenceRepository) {
        this.ticketSequenceRepository = ticketSequenceRepository;
    }

    /**
     * Generates a ticket number for the given prefix and claim category ID.
     *
     * @param prefix the ticket prefix (e.g., R-ESFPS, R-SEPS, etc.)
     * @param claimCatId the claim category ID to be embedded in the ticket number
     * @param referenceFormattedTicket the formatted reference ticket (used for SAME strategy)
     * @return a formatted ticket number like "R-ESFPS-2025-005-000000000000123"
     */
    public String generateTicket(String prefix, long claimCatId, String referenceFormattedTicket) {
        NumberingConfig config = NumberingConstants.getConfig(prefix);
        int year = Year.now().getValue();
        long ticketNumber;

        if (config.getStrategy() == StrategyTypeEnum.SAME && referenceFormattedTicket != null) {
            // Use the number from the referenced ticket
            ticketNumber = extractNumber(referenceFormattedTicket);
        } else {
            // Generate a new number according to INDEPENDENT strategy
            ticketNumber = getNextIndependentNumber(prefix, year, config.getContinueType());
        }

        return formatTicketNumber(prefix, year, ticketNumber, claimCatId);
    }

    /**
     * Retrieves the next independent ticket number for the given prefix and year,
     * based on whether the sequence should RESET annually or CONTINUE across years.
     *
     * @param prefix the ticket prefix
     * @param year the current year
     * @param continueType RESET or CONTINUE behavior
     * @return the next ticket number
     */
    private long getNextIndependentNumber(String prefix, int year, ContinueTypeEnum continueType) {
        if (continueType == ContinueTypeEnum.RESET) {
            // RESET every year
            TicketSequence sequence = ticketSequenceRepository.findAndLock(prefix, year)
                .orElseGet(() -> {
                    TicketSequence newSeq = new TicketSequence();
                    newSeq.setPrefix(prefix);
                    newSeq.setYear(year);
                    newSeq.setLastNumber(0L);
                    return ticketSequenceRepository.save(newSeq);
                });

            long next = sequence.getLastNumber() + 1;
            sequence.setLastNumber(next);
            return next;

        } else {
            // CONTINUE across years
            List<TicketSequence> allSequences = ticketSequenceRepository.findAllByPrefixLocked(prefix);
            long max = allSequences.stream()
                .mapToLong(TicketSequence::getLastNumber)
                .max().orElse(0L) + 1;

            TicketSequence sequence = ticketSequenceRepository.findAndLock(prefix, year)
                .orElseGet(() -> {
                    TicketSequence newSeq = new TicketSequence();
                    newSeq.setPrefix(prefix);
                    newSeq.setYear(year);
                    newSeq.setLastNumber(0L);
                    return ticketSequenceRepository.save(newSeq);
                });

            sequence.setLastNumber(max);
            return max;
        }
    }

    /**
     * Extracts the numeric sequence part from a formatted ticket ID.
     * Assumes the format is PREFIX-YEAR-CLAIMCATID-NUMBER
     *
     * @param formattedTicket the full formatted ticket ID string
     * @return the extracted numeric ticket number
     */
    private long extractNumber(String formattedTicket) {
        String[] parts = formattedTicket.split("-");
        return Long.parseLong(parts[3]);
    }

    /**
     * Formats the ticket number using a standard format:
     * PREFIX-YEAR-CLAIMCATID-TICKETNUMBER (padded to 15 digits)
     *
     * @param prefix the ticket prefix
     * @param year the current year
     * @param number the sequential ticket number
     * @param claimCatId the claim category ID
     * @return the formatted ticket ID string
     */
    private String formatTicketNumber(String prefix, int year, long number, long claimCatId) {
        return String.format("%s-%d-%03d-%015d", prefix, year, claimCatId, number);
    }
}
