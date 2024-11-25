package com.seps.ticket.service;

import com.seps.ticket.repository.ClaimTicketRepository;

public class TicketIdGenerator {

    private static final int MAX_RETRIES = 5;


    public static long generateUniqueTicketId(int integerPart, ClaimTicketRepository repository) {
        long ticketId;
        int retries = 0;
        do {
            long timestampPart = System.currentTimeMillis(); // 13-digit timestamp
            int maxIntegerPart = 99;
            integerPart = Math.abs(integerPart % maxIntegerPart); // Ensure integerPart is between 0 and 99
            ticketId = Long.parseLong(timestampPart + String.format("%02d", integerPart));

            retries++;
            if (retries > MAX_RETRIES) {
                // Log failure and throw exception with retries info
                throw new IllegalStateException("Unable to generate unique ticket ID after " + MAX_RETRIES + " retries. Last attempted ticketId: " + ticketId);
            }
        } while (repository.existsByTicketId(ticketId)); // Check for duplicates

        return ticketId;
    }

}
