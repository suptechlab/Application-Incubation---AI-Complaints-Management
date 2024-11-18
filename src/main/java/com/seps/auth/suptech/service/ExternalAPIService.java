package com.seps.auth.suptech.service;

import com.seps.auth.service.dto.ConsultationRequest;
import com.seps.auth.suptech.service.dto.PersonInfoDTO;

public interface ExternalAPIService {

    PersonInfoDTO getPersonInfo(String identificacion);

    Boolean validateIndividualPerson(ConsultationRequest request);
}
