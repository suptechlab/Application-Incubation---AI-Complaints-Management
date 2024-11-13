package com.seps.auth.service;

import com.seps.auth.domain.Otp;
import com.seps.auth.repository.OtpRepository;
import com.seps.auth.web.rest.errors.CustomException;
import com.seps.auth.web.rest.errors.SepsStatusCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.zalando.problem.Status;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class OtpService {

    private static final int OTP_LENGTH = 6; // Length of the OTP
    private static final long OTP_EXPIRATION_DURATION = 5; // OTP expiration duration in minutes
    private static final long OTP_TOKEN_EXPIRATION_DURATION = 15; // OTP token expiration duration in minutes
    private static final SecureRandom random = new SecureRandom();
    private static final Logger LOG = LoggerFactory.getLogger(OtpService.class);
    private final OtpRepository otpRepository;

    public OtpService(OtpRepository otpRepository) {
        this.otpRepository = otpRepository;
    }

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

    public Otp generateOtp(String email) {
        // Generate new OTP code
        String otpCode = generateOtpCode();
        // Set expiry time for the OTP (e.g., 5 minutes from now)
        Instant expiryTime = Instant.now().plusSeconds(OTP_EXPIRATION_DURATION * 60);
        // Check if OTP for the email already exists
        Optional<Otp> existingOtp = otpRepository.findByEmail(email);
        Otp otp;
        if (existingOtp.isPresent()) {
            // If OTP exists for the email, update the entity with the new OTP
            otp = existingOtp.get();
        } else {
            // If no OTP exists for the email, create a new one
            otp = new Otp();
            otp.setEmail(email);
        }
        otp.setOtpCode(otpCode);
        otp.setUsed(false);  // Reset OTP as unused
        otp.setExpiryTime(expiryTime);
        otpRepository.save(otp);
        // Simulate sending OTP (Here you would use email service)
        LOG.debug("Sent OTP: {} to email:{}", otpCode, email);
        return otp;
    }

    /**
     * Verifies the provided OTP code for the given email.
     * <p>
     * This method retrieves the OTP entity associated with the specified email.
     * It validates whether the OTP code matches and is not expired. If the OTP
     * is valid and unused, it marks the OTP as used and returns {@code true}.
     * If the OTP is expired, does not match, or has already been used, it
     * returns {@code false}.
     * </p>
     *
     * @param email   The email address associated with the OTP to verify.
     * @param otpCode The OTP code to be verified.
     * @return {@code true} if the OTP is valid, matches, and is unused; {@code false} otherwise.
     * @throws CustomException if the OTP has already been used, with status {@code BAD_REQUEST}
     *                         and error code {@code SepsStatusCode.OTP_COD_ALREADY_USED}.
     */
    public boolean verifyOtp(String email, String otpCode) {
        // Retrieve OTP entity using Optional to handle the absence of the entity
        Optional<Otp> otpEntityOpt = otpRepository.findByEmail(email);
        if (otpEntityOpt.isPresent()) {
            Otp otp = otpEntityOpt.get();
            // Check if OTP is valid
            if (otp.isUsed()) {
                throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.OTP_COD_ALREADY_USED, null, null);
            }
            // Check if the OTP matches and is still valid (not expired)
            if (otp.getOtpCode().equals(otpCode) && otp.getExpiryTime().isAfter(Instant.now())) {
                // OTP is valid, delete it (optional)
                // Mark OTP as used
                otp.setUsed(true);
                otpRepository.save(otp);
                return true;
            }
        }
        return false;  // Either OTP doesn't match or it's expired
    }
}
