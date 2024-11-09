package com.seps.user.repository;


import com.seps.user.domain.ChatbotSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatbotSessionRepository extends JpaRepository<ChatbotSession, Long> {

    Optional<ChatbotSession> findBySessionId(String sessionId);
}
