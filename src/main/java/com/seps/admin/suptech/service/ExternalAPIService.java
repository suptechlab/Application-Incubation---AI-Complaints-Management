package com.seps.admin.suptech.service;

import com.seps.admin.suptech.service.dto.OrganizationInfoDTO;
import com.seps.admin.suptech.service.dto.PersonInfoDTO;

public interface ExternalAPIService {
    PersonInfoDTO getPersonInfo(String identificacion);

    OrganizationInfoDTO getOrganizationInfo(String ruc);
}
