package com.seps.ticket.service;

import com.seps.ticket.domain.ClaimTicketOTP;
import com.seps.ticket.repository.ClaimTicketOTPRepository;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.zalando.problem.Status;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.UUID;

@Service
public class ClaimTicketOTPService {

    private static final int OTP_LENGTH = 6; // Length of the OTP
    private static final long OTP_EXPIRATION_DURATION = 5; // OTP expiration duration in minutes
    private static final long OTP_TOKEN_EXPIRATION_DURATION = 15; // OTP token expiration duration in minutes
    private static final SecureRandom random = new SecureRandom();
    private static final Logger LOG = LoggerFactory.getLogger(ClaimTicketOTPService.class);
    private final ClaimTicketOTPRepository claimTicketOTPRepository;

    public ClaimTicketOTPService(ClaimTicketOTPRepository claimTicketOTPRepository) {
        this.claimTicketOTPRepository = claimTicketOTPRepository;
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

    public ClaimTicketOTP generateOtp(String email) {
        String otpCode = generateOtpCode();
        Instant expiryTime = Instant.now().plusSeconds(OTP_EXPIRATION_DURATION * 60);
        ClaimTicketOTP otp = claimTicketOTPRepository.findOneByEmailIgnoreCase(email)
            .orElseGet(() -> {
                ClaimTicketOTP newOtp = new ClaimTicketOTP();
                newOtp.setEmail(email);
                return newOtp;
            });
        otp.setOtpCode(otpCode);
        otp.setUsed(false);
        otp.setExpiryTime(expiryTime);
        claimTicketOTPRepository.save(otp);
        LOG.debug("Sent OTP: {} to email:{}", otpCode, email);
        return otp;
    }

    public Boolean verifyOtp(String email, String otpCode) {
        ClaimTicketOTP otp = claimTicketOTPRepository.findOneByEmailIgnoreCase(email)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_OTP_CODE, null, null));
        if (otp.isUsed()) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.OTP_COD_ALREADY_USED, null, null);
        }
        if (otp.getOtpCode().equals(otpCode) && otp.getExpiryTime().isAfter(Instant.now())) {
            otp.setUsed(true);
            claimTicketOTPRepository.save(otp);
            return true;
        }
        return false;
    }
}
