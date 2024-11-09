package com.seps.user.service;

import com.seps.user.domain.ChatbotSession;
import com.seps.user.repository.ChatbotSessionRepository;
import com.seps.user.service.dto.ChatbotQueryDTO;
import com.seps.user.service.dto.RasaResponseDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Service class for handling chatbot queries and managing chatbot sessions.
 */
@Service
@Transactional
public class ChatbotService {

    private final ChatbotSessionRepository chatbotSessionRepository;
    private final WebClient webClient;

    /**
     * Constructor for ChatbotService.
     *
     * @param chatbotSessionRepository the repository for managing chatbot sessions.
     */
    public ChatbotService(ChatbotSessionRepository chatbotSessionRepository) {
        this.chatbotSessionRepository = chatbotSessionRepository;
        this.webClient = WebClient.builder()
            .baseUrl("http://localhost:5005")
            .build();
    }

    /**
     * Handles a query to the chatbot. If the session ID is provided and valid, it updates the last accessed date.
     * Otherwise, it creates a new session for the user. The query is then sent to the Rasa server.
     *
     * @param queryDTO the data transfer object containing the query and session/user information.
     * @return a Flux of RasaResponseDTO containing the responses from the Rasa server.
     */
    public Flux<RasaResponseDTO> handleQuery(ChatbotQueryDTO queryDTO) {
        String sessionId = queryDTO.getSessionId();
        if (sessionId == null || sessionId.isBlank()) {
            sessionId = createNewSession(queryDTO.getUserId());
        } else {
            updateLastAccessedDate(sessionId);
        }

        return sendQueryToRasa(queryDTO.getQuery(), sessionId);
    }

    /**
     * Creates a new session for the user and saves it to the database.
     *
     * @param userId the ID of the user for whom the session is being created.
     * @return the generated session ID.
     */
    private String createNewSession(Long userId) {
        String sessionId = UUID.randomUUID().toString();
        ChatbotSession session = new ChatbotSession();
        session.setUserId(userId);
        session.setSessionId(sessionId);
        chatbotSessionRepository.save(session);
        return sessionId;
    }

    /**
     * Updates the last accessed date of an existing session.
     *
     * @param sessionId the session ID whose last accessed date needs to be updated.
     */
    private void updateLastAccessedDate(String sessionId) {
        Optional<ChatbotSession> session = chatbotSessionRepository.findBySessionId(sessionId);
        session.ifPresent(s -> {
            s.setLastAccessedDate(Instant.now());
            chatbotSessionRepository.save(s);
        });
    }

    /**
     * Sends the user's query to the Rasa server and retrieves the response.
     *
     * @param query     the query message from the user.
     * @param sessionId the session ID used to maintain the context of the conversation.
     * @return a Flux of RasaResponseDTO containing the responses from the Rasa server.
     */
    private Flux<RasaResponseDTO> sendQueryToRasa(String query, String sessionId) {
        String payload = String.format("{\"sender\": \"%s\", \"message\": \"%s\"}", sessionId, query);

        return webClient.post()
            .uri("/webhooks/rest/webhook")
            .header("Content-Type", "application/json")
            .bodyValue(payload)
            .retrieve()
            .bodyToFlux(RasaResponseDTO.class);
    }
}
