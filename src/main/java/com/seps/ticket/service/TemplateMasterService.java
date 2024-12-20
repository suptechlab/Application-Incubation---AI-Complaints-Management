package com.seps.ticket.service;

import com.seps.ticket.domain.TemplateMaster;
import com.seps.ticket.repository.TemplateMasterRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.zalando.problem.Status;

@Service
public class TemplateMasterService {

    private static final Logger LOG = LoggerFactory.getLogger(TemplateMasterService.class);

    private final TemplateMasterRepository templateMasterRepository;

    public TemplateMasterService(TemplateMasterRepository templateMasterRepository) {
        this.templateMasterRepository = templateMasterRepository;
    }


    public TemplateMaster findActiveTemplate(Long id) {
        return templateMasterRepository.findByIdAndStatus(id, true).orElse(null);
    }


}
