package com.seps.ticket.suptech.service;

import com.seps.ticket.service.dto.MailDTO;
import com.seps.ticket.suptech.service.dto.PersonInfoDTO;

public interface ExternalAPIService {

    Boolean sendEmailViaApi(MailDTO mailDTO, String subject, String renderedContent);

    PersonInfoDTO getPersonInfo(String identificacion);

}
