package com.seps.auth.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.UUID;

public class OtpService {

    private static final int OTP_LENGTH = 6; // Length of the OTP
    private static final long OTP_EXPIRATION_DURATION = 5; // OTP expiration duration in minutes
    private static final long OTP_TOKEN_EXPIRATION_DURATION = 10; // OTP token expiration duration in minutes
    private static final SecureRandom random = new SecureRandom();

    /**
     * Generates a random OTP code.
     *
     * @return A string representing the OTP code.
     */
    public String generateOtpCode() {
        // Generate a random OTP code
        StringBuilder otpCode = new StringBuilder(OTP_LENGTH);
        for (int i = 0; i < OTP_LENGTH; i++) {
            otpCode.append(random.nextInt(10)); // Append a random digit (0-9)
        }
        return otpCode.toString();
    }

    /**
     * Gets the expiration time for the generated OTP.
     *
     * @return An Instant representing the expiration time for the OTP.
     */
    public Instant getOtpExpirationTime() {
        // Set the OTP expiration time to 5 minutes from now
        return Instant.now().plusSeconds(OTP_EXPIRATION_DURATION * 60);
    }

    /**
     * Generates a unique OTP token.
     *
     * @return A string representing the OTP token.
     */
    public String generateOtpToken() {
        // Generate a unique OTP token using UUID
        return UUID.randomUUID().toString();
    }

    /**
     * Gets the expiration time for the generated OTP token.
     *
     * @return An Instant representing the expiration time for the OTP token.
     */
    public Instant getOtpTokenExpirationTime() {
        // Set the OTP token expiration time to 10 minutes from now
        return Instant.now().plusSeconds(OTP_TOKEN_EXPIRATION_DURATION * 60);
    }
}
