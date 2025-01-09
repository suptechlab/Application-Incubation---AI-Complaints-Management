package com.seps.user.service;

import com.seps.user.domain.ChatbotSession;
import com.seps.user.repository.ChatbotSessionRepository;
import com.seps.user.service.dto.ChatbotQueryDTO;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ChatbotService {

    private final Logger log = LoggerFactory.getLogger(ChatbotService.class);

    private final ChatbotSessionRepository chatbotSessionRepository;
    private WebClient webClient;
    private final UserService userService;

    @Value("${website.chatbot-base-url:test}")
    private String chatBotBaseUrl;

    public ChatbotService(ChatbotSessionRepository chatbotSessionRepository, UserService userService) {
        this.chatbotSessionRepository = chatbotSessionRepository;
        this.userService = userService;
    }

    @PostConstruct
    public void init() {
        this.webClient = WebClient.builder()
            .baseUrl(chatBotBaseUrl)
            .build();
    }

    public Flux<Object> handleQuery(ChatbotQueryDTO queryDTO) {
        String sessionId = queryDTO.getSender();
        if (sessionId == null || sessionId.isBlank()) {
            Long userId = userService.getCurrentUserId();
            sessionId = createNewSession(userId);
            queryDTO.setSender(sessionId);
        } else {
            updateLastAccessedDate(sessionId);
        }

        return sendQueryToRasa(queryDTO);
    }

    private String createNewSession(Long userId) {
        String sessionId = UUID.randomUUID().toString();
        ChatbotSession session = new ChatbotSession();
        session.setUserId(userId);
        session.setSessionId(sessionId);
        chatbotSessionRepository.save(session);
        return sessionId;
    }

    private void updateLastAccessedDate(String sessionId) {
        Optional<ChatbotSession> session = chatbotSessionRepository.findBySessionId(sessionId);
        session.ifPresent(s -> {
            s.setLastAccessedDate(Instant.now());
            chatbotSessionRepository.save(s);
        });
    }

    private Flux<Object> sendQueryToRasa(ChatbotQueryDTO queryDTO) {
        String jwtToken = userService.getCurrentUserJwtToken();
        WebClient.RequestHeadersSpec<?> requestSpec = webClient.post()
            .uri("/webhooks/rest/webhook")
            .bodyValue(queryDTO);

        if (jwtToken != null) {
            requestSpec.headers(headers -> headers.setBearerAuth(jwtToken));
        }

        return requestSpec.retrieve()
            .bodyToFlux(Object.class); // Return raw response
    }
}
