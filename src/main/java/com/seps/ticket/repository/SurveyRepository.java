package com.seps.ticket.repository;


import com.seps.ticket.domain.Survey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SurveyRepository extends JpaRepository<Survey, Long> {
    Optional<Survey> findByUserId(Long userId);

    Optional<Survey> findByToken(String token);
}
