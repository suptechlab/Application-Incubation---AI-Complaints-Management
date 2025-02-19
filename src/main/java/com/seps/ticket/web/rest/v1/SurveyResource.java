package com.seps.ticket.web.rest.v1;

import com.seps.ticket.domain.Survey;
import com.seps.ticket.service.SurveyService;
import com.seps.ticket.service.dto.ResponseStatus;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import com.seps.ticket.web.rest.vm.SurveySubmitRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zalando.problem.Status;

import java.net.URI;
import java.net.URISyntaxException;

@Tag(name = "Survey Management", description = "APIs for Survey Management")
@RestController
@RequestMapping("/api/v1/survey")
public class SurveyResource {

    private static final Logger LOG = LoggerFactory.getLogger(SurveyResource.class);

    private final SurveyService surveyService;
    private final MessageSource messageSource;

    public SurveyResource(SurveyService surveyService, MessageSource messageSource) {
        this.surveyService = surveyService;
        this.messageSource = messageSource;
    }

    @PostMapping("/submit")
    public ResponseEntity<ResponseStatus> submitSurvey(@RequestBody SurveySubmitRequest survey) throws URISyntaxException {
        LOG.debug("REST request to submit Survey: {}", survey);

        if (surveyService.hasUserCompletedSurvey(survey.getToken())) {
            throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.YOU_ALREADY_COMPLETE_THE_SURVEY, null, null);
        }

        Survey createdSurvey = surveyService.saveSurvey(survey);
        ResponseStatus responseStatus = new ResponseStatus(
            messageSource.getMessage("survey.submitted.successfully", null, LocaleContextHolder.getLocale()),
            HttpStatus.CREATED.value(),
            System.currentTimeMillis()
        );
        return ResponseEntity.created(new URI("/api/v1/survey/" + createdSurvey.getId()))
            .body(responseStatus);
    }

}
