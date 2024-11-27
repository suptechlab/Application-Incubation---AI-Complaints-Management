package com.seps.ticket.service;

import com.google.gson.Gson;
import com.seps.ticket.domain.*;
import com.seps.ticket.enums.*;
import com.seps.ticket.repository.*;
import com.seps.ticket.security.AuthoritiesConstants;
import com.seps.ticket.service.dto.UserClaimTicketDTO;
import com.seps.ticket.service.mapper.ClaimTicketMapper;
import com.seps.ticket.service.mapper.UserClaimTicketMapper;
import com.seps.ticket.service.specification.ClaimTicketSpecification;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import org.springframework.context.MessageSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.zalando.problem.Status;

import java.util.*;


@Service
public class SepsAndFiClaimTicketService {

    private final ProvinceRepository provinceRepository;
    private final CityRepository cityRepository;
    private final OrganizationRepository organizationRepository;
    private final ClaimTypeRepository claimTypeRepository;
    private final ClaimSubTypeRepository claimSubTypeRepository;
    private final ClaimTicketRepository claimTicketRepository;
    private final UserService userService;
    private final UserClaimTicketMapper userClaimTicketMapper;
    private final AuditLogService auditLogService;
    private final Gson gson;
    private final MessageSource messageSource;
    private final ClaimTicketMapper claimTicketMapper;

    public SepsAndFiClaimTicketService(ProvinceRepository provinceRepository, CityRepository cityRepository,
                                       OrganizationRepository organizationRepository, ClaimTypeRepository claimTypeRepository,
                                       ClaimSubTypeRepository claimSubTypeRepository, ClaimTicketRepository claimTicketRepository,
                                       UserService userService, UserClaimTicketMapper userClaimTicketMapper,
                                       AuditLogService auditLogService, Gson gson, MessageSource messageSource,
                                       ClaimTicketMapper claimTicketMapper) {
        this.provinceRepository = provinceRepository;
        this.cityRepository = cityRepository;
        this.organizationRepository = organizationRepository;
        this.claimTypeRepository = claimTypeRepository;
        this.claimSubTypeRepository = claimSubTypeRepository;
        this.claimTicketRepository = claimTicketRepository;
        this.userService = userService;
        this.userClaimTicketMapper = userClaimTicketMapper;
        this.auditLogService = auditLogService;
        this.gson = gson;
        this.messageSource = messageSource;
        this.claimTicketMapper = claimTicketMapper;
    }

    public Page<UserClaimTicketDTO> listSepsAndFiClaimTickets(Pageable pageable, String search, ClaimTicketStatusEnum claimTicketStatus, ClaimTicketPriorityEnum claimTicketPriority, String startDate, String endDate) {
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        Long organizationId = null;
        if(authority.contains(AuthoritiesConstants.FI)){
            organizationId = currentUser.getOrganization().getId();
        }
        Long fiAgentId = null;

        return claimTicketRepository.findAll(ClaimTicketSpecification.bySepsFiFilter(search, organizationId, claimTicketStatus, claimTicketPriority, startDate, endDate, fiAgentId), pageable)
            .map(userClaimTicketMapper::toUserClaimTicketDTO);
    }

    public UserClaimTicketDTO getSepsFiClaimTicketById(Long id) {
        User currentUser = userService.getCurrentUser();
        List<String> authority = currentUser.getAuthorities().stream()
            .map(Authority::getName)
            .toList();
        Long organizationId = null;
        if(authority.contains(AuthoritiesConstants.FI)){
            organizationId = currentUser.getOrganization().getId();
        }
        if(organizationId!=null) {
            return claimTicketRepository.findByIdAndOrganizationId(id, organizationId)
                .map(userClaimTicketMapper::toUserClaimTicketDTO)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{id.toString()}, null));
        }else{
            return claimTicketRepository.findById(id)
                .map(userClaimTicketMapper::toUserClaimTicketDTO)
                .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TICKET_NOT_FOUND,
                    new String[]{id.toString()}, null));
        }
    }
}
