package com.seps.ticket.suptech.service;

import com.seps.ticket.service.dto.MailDTO;

public interface ExternalAPIService {

    Boolean sendEmailViaApi(MailDTO mailDTO, String subject, String renderedContent);
}
