package com.seps.ticket.web.rest.v1;

import com.seps.ticket.service.MailService;
import com.seps.ticket.service.dto.ResponseStatus;
import com.seps.ticket.web.rest.vm.TranscriptJson;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/transcripts")
@Tag(name = "Transcripts", description = "Operations related to Transcripts APIs.")
public class TranscriptResource {

    @Value("${mibew.recipient-email:mibew.suptech@seps.gob.ec}")
    public String mibewRecipient;
    private final MailService mailService;
    private final MessageSource messageSource;

    public TranscriptResource(MailService mailService, MessageSource messageSource) {
        this.mailService = mailService;
        this.messageSource = messageSource;
    }

    @PostMapping("/send")
    public ResponseEntity<ResponseStatus> sendTranscript(@Valid @RequestBody TranscriptJson transcriptJson) {
        // Parse the transcript JSON
        String transcript = transcriptJson.getTranscript();
        // Format the current timestamp to Ecuadorian time using pattern
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(ZoneId.of("America/Guayaquil"));
        String timestamp = formatter.format(Instant.now());
        // Send email
        mailService.sendTranscriptEmail(mibewRecipient, transcript, timestamp);
        // Create response status
        ResponseStatus responseStatus = new ResponseStatus(
                messageSource.getMessage("transcript.email.sent.successfully", null, LocaleContextHolder.getLocale()),
                HttpStatus.OK.value(),
                System.currentTimeMillis()
        );
        return ResponseEntity.ok(responseStatus);
    }

}
