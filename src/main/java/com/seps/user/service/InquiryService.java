package com.seps.user.service;

import com.seps.user.domain.ChatbotSession;
import com.seps.user.domain.Inquiry;
import com.seps.user.domain.User;
import com.seps.user.repository.ChatbotSessionRepository;
import com.seps.user.repository.InquiryRepository;
import com.seps.user.web.rest.vm.InquiryRequestDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
@Transactional
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final ChatbotSessionRepository chatbotSessionRepository;
    private final UserService userService;

    public InquiryService(InquiryRepository inquiryRepository, ChatbotSessionRepository chatbotSessionRepository, UserService userService) {
        this.inquiryRepository = inquiryRepository;
        this.chatbotSessionRepository = chatbotSessionRepository;
        this.userService = userService;
    }

    public Inquiry save(InquiryRequestDTO inquiryDto) {
        Inquiry inquiry = new Inquiry();
        inquiry.setInquiryChannel(inquiryDto.getInquiryChannel());
        inquiry.setInquiryRedirect(inquiryDto.getInquiryRedirect());
        inquiry.setAttentionTime(inquiryDto.getAttentionTime());
        inquiry.setClarityResponse(inquiryDto.getClarityResponse());
        inquiry.setFormatsProvided(inquiryDto.getFormatsProvided());
        inquiry.setInquiryResolved(inquiryDto.getInquiryResolved());
        inquiry.setEaseOfFinding(inquiryDto.getEaseOfFinding());
        inquiry.setUserName(inquiryDto.getUserName());
        inquiry.setSenderId(inquiryDto.getSenderId());

        Optional<ChatbotSession> session = chatbotSessionRepository.findBySessionId(inquiryDto.getSenderId());
        session.ifPresent(s -> {
            inquiry.setUserId(s.getUserId());
            if(s.getUserId() != null){
                User user = userService.findUserById(s.getUserId());
                if(user != null) {
                    inquiry.setUserName(user.getFirstName());
                }
            }
        });

        inquiry.setInquiryDate(Instant.now()); // Set timestamp
        return inquiryRepository.save(inquiry);
    }
}

