package com.seps.ticket.service;

import com.seps.ticket.domain.Survey;
import com.seps.ticket.repository.SurveyRepository;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import com.seps.ticket.web.rest.vm.SurveySubmitRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

import java.io.UnsupportedEncodingException;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class SurveyService {

    private final SurveyRepository surveyRepository;

    @Value("${website.user-base-url:test}")
    private String userBaseUrl;

    public SurveyService(SurveyRepository surveyRepository) {
        this.surveyRepository = surveyRepository;
    }

    public Optional<Survey> getSurveyByUserId(Long userId) {
        return surveyRepository.findByUserId(userId);
    }

    public Survey saveSurvey(SurveySubmitRequest surveyRequest) {
        Survey survey = surveyRepository.findByToken(surveyRequest.getToken()).orElseThrow(()->
        new CustomException(Status.BAD_REQUEST, SepsStatusCode.INVALID_SURVEY, null, null));
        survey.setAttentionTime(surveyRequest.getAttentionTime());
        survey.setEaseOfFindingInfo(surveyRequest.getEaseOfFindingInfo());
        survey.setProvidedFormats(surveyRequest.getProvidedFormats());
        survey.setResponseClarity(surveyRequest.getResponseClarity());
        survey.setComment(surveyRequest.getComment());
        survey.setCompleted(true);
        return surveyRepository.save(survey);
    }

    public boolean hasUserCompletedSurvey(String token) {
        return surveyRepository.findByToken(token).map(Survey::getCompleted).orElse(false);
    }

    public String generateSurveyLink(Long userId, Long ticketId) {
        return surveyRepository.findByUserIdAndTicketId(userId, ticketId)
            .map(survey -> userBaseUrl + "/satisfaction-survey?token=" + survey.getToken())
            .orElseGet(() -> createNewSurvey(userId, ticketId));
    }

    public String getGeneratedSurveyLink(Long userId, Long ticketId) {
        return surveyRepository.findByUserIdAndTicketId(userId, ticketId)
            .map(survey -> userBaseUrl + "/satisfaction-survey?token=" + survey.getToken())
            .orElse("N/A");
    }
    private String createNewSurvey(Long userId, Long ticketId) {
        String token = UUID.randomUUID().toString();
        Survey newSurvey = new Survey();
        newSurvey.setTicketId(ticketId);
        newSurvey.setUserId(userId);
        newSurvey.setToken(token);
        newSurvey.setCompleted(false);
        surveyRepository.saveAndFlush(newSurvey);

        return userBaseUrl + "/satisfaction-survey?token=" + token;
    }
}
