package com.seps.admin.service;

import com.google.gson.Gson;
import com.seps.admin.config.Constants;
import com.seps.admin.domain.Organization;
import com.seps.admin.domain.User;
import com.seps.admin.enums.ActionTypeEnum;
import com.seps.admin.enums.ActivityTypeEnum;
import com.seps.admin.enums.LanguageEnum;
import com.seps.admin.repository.OrganizationRepository;
import com.seps.admin.service.dto.DropdownListDTO;
import com.seps.admin.service.dto.OrganizationDTO;
import com.seps.admin.service.dto.RequestInfo;
import com.seps.admin.service.mapper.OrganizationMapper;
import com.seps.admin.suptech.service.ExternalAPIService;
import com.seps.admin.suptech.service.OrganizationNotFoundException;
import com.seps.admin.suptech.service.dto.OrganizationInfoDTO;
import com.seps.admin.web.rest.errors.CustomException;
import com.seps.admin.web.rest.errors.SepsStatusCode;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

import java.util.*;

import static com.seps.admin.component.CommonHelper.convertEntityToMap;
import static com.seps.admin.component.CommonHelper.capitalizeCustom;
@Service
public class OrganizationService {

    private final ExternalAPIService externalAPIService;
    private final OrganizationRepository organizationRepository;
    private final MessageSource messageSource;
    private final UserService userService;
    private final Gson gson;
    private final AuditLogService auditLogService;
    private final OrganizationMapper organizationMapper;

    public OrganizationService(ExternalAPIService externalAPIService, OrganizationRepository organizationRepository,
                               MessageSource messageSource, @Lazy UserService userService, Gson gson, AuditLogService auditLogService,
                               OrganizationMapper organizationMapper) {
        this.externalAPIService = externalAPIService;
        this.organizationRepository = organizationRepository;
        this.messageSource = messageSource;
        this.userService = userService;
        this.gson = gson;
        this.auditLogService = auditLogService;
        this.organizationMapper = organizationMapper;
    }

    /**
     * Fetches the details of an organization based on the provided RUC (Taxpayer Registration Number).
     * If the organization is not found in the database, it creates a new organization and logs an audit trail.
     *
     * @param ruc         The RUC (Taxpayer Registration Number) of the organization to fetch.
     * @param requestInfo Information about the request, typically for logging or auditing purposes.
     * @return The {@link OrganizationInfoDTO} containing the organization's details.
     * @throws CustomException               If the organization is not found and the RUC does not exist in the system.
     * @throws OrganizationNotFoundException If the organization cannot be fetched from the external API.
     */
    @Transactional
    public OrganizationInfoDTO fetchOrganizationDetails(String ruc, RequestInfo requestInfo) {
        User currenUser = userService.getCurrentUser();
        try {
            OrganizationInfoDTO organizationInfoDTO = externalAPIService.getOrganizationInfo(ruc);
            Optional<Organization> optionalOrganization = organizationRepository.findByRuc(organizationInfoDTO.getRuc());
            if (!optionalOrganization.isPresent()) {
                Map<String, String> auditMessageMap = new HashMap<>();
                Map<String, Object> entityData = new HashMap<>();
                //Create a new Organization
                Organization organization = new Organization();
                organization.setRuc(organizationInfoDTO.getRuc());
                organization.setRazonSocial(organizationInfoDTO.getRazonSocial());
                organization.setNemonicoTipoOrganizacion(organizationInfoDTO.getNemonicoTipoOrganizacion());
                organization.setTipoOrganizacion(organizationInfoDTO.getTipoOrganizacion());
                organization.setCreatedBy(currenUser.getId());
                organizationRepository.save(organization);

                //Audit Logs
                Arrays.stream(LanguageEnum.values()).forEach(language -> {
                    String messageAudit = messageSource.getMessage("audit.log.organization.created",
                        new Object[]{currenUser.getEmail(), organization.getId()}, Locale.forLanguageTag(language.getCode()));
                    auditMessageMap.put(language.getCode(), messageAudit);
                });
                entityData.put(Constants.NEW_DATA, convertEntityToMap(this.getOrganizationById(organization.getId())));
                String requestBody = null;
                auditLogService.logActivity(null, currenUser.getId(), requestInfo, "fetchOrganizationDetails", ActionTypeEnum.ORGANIZATION_MASTER_ADD.name(), organization.getId(), Organization.class.getSimpleName(),
                    null, auditMessageMap, entityData, ActivityTypeEnum.DATA_ENTRY.name(), requestBody);
            }
            return organizationInfoDTO;
        } catch (OrganizationNotFoundException e) {
            throw new CustomException(Status.NOT_FOUND, SepsStatusCode.ORGANIZATION_RUC_NOT_FOUND,
                new String[]{ruc}, null);
        }
    }


    @Transactional
    public OrganizationDTO getOrganizationById(Long id) {
        return organizationRepository.findById(id)
            .map(organizationMapper::toDTO)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.ORGANIZATION_NOT_FOUND,
                new String[]{id.toString()}, null));
    }

    @Transactional
    public Organization getOrganizationByRuc(String ruc) {
        return organizationRepository.findByRuc(ruc)
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.ORGANIZATION_RUC_NOT_FOUND,
                new String[]{ruc}, null));
    }

    /**
     * Fetches a list of organizations and maps them to a list of {@link DropdownListDTO}.
     *
     * <p>This method retrieves all organizations from the database, formats their details
     * (combining the organization's nemonico type and RUC in a specific format), and
     * converts them into {@link DropdownListDTO} objects to be used in dropdown menus or
     * similar UI components.</p>
     *
     * @return a list of {@link DropdownListDTO} containing the organization's ID and
     *         formatted name in the format: "nemonicoTipoOrganizacion (RUC)".
     */
    public List<DropdownListDTO> fetchOrganizationList() {
        return organizationRepository.findAll().stream()
            .map(org->{
                DropdownListDTO orgDto = new DropdownListDTO();
                orgDto.setId(org.getId());
                orgDto.setName(capitalizeCustom(org.getRazonSocial()) + " (" + org.getRuc() + ")" );
                return orgDto;
            })
            .toList();
    }
}
