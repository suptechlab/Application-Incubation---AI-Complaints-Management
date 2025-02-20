package com.seps.user.web.rest.v1;

import com.seps.user.domain.Inquiry;
import com.seps.user.service.InquiryService;
import com.seps.user.web.rest.vm.InquiryRequestDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

@RestController
@RequestMapping("/api/v1/inquiry")
public class InquiryResource {

    private final InquiryService inquiryService;
    private static final String API_KEY_HEADER = "X-API-KEY";

    @Value("${website.api-key:test}")
    private String secureApiKey; // Store securely

    public InquiryResource(InquiryService inquiryService) {
        this.inquiryService = inquiryService;
    }

    private boolean isValidApiKey(String apiKey) {
        return !secureApiKey.equals(apiKey);
    }

    @PostMapping
    public ResponseEntity<Inquiry> createInquiry(@Valid @RequestBody InquiryRequestDTO inquiry,
                                                 @RequestHeader(value = API_KEY_HEADER) String apiKey) throws URISyntaxException {
        if (isValidApiKey(apiKey)) {
            return ResponseEntity.status(403).body(null);
        }
        Inquiry result = inquiryService.save(inquiry);
        return ResponseEntity.created(new URI("/api/v1/inquiry/" + result.getId())).body(result);
    }

}

