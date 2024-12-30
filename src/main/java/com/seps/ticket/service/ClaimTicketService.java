package com.seps.ticket.service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.seps.ticket.component.EnumUtil;
import com.seps.ticket.config.InstantTypeAdapter;
import com.seps.ticket.repository.*;
import com.seps.ticket.service.dto.ClaimTicketResponseDTO;
import com.seps.ticket.service.mapper.ClaimTicketMapper;
import com.seps.ticket.service.mapper.UserClaimTicketMapper;
import com.seps.ticket.suptech.service.DocumentService;
import com.seps.ticket.web.rest.vm.CreateClaimTicketRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class ClaimTicketService {

    private static final Logger LOG = LoggerFactory.getLogger(ClaimTicketService.class);

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
    private final DocumentService documentService;
    private final ClaimTicketDocumentRepository claimTicketDocumentRepository;
    private final ClaimTicketStatusLogRepository claimTicketStatusLogRepository;
    private final ClaimTicketInstanceLogRepository claimTicketInstanceLogRepository;
    private final ClaimTicketPriorityLogRepository claimTicketPriorityLogRepository;
    private static final boolean IS_INTERNAL_DOCUMENT = false;
    private final EnumUtil enumUtil;
    private final ClaimTicketActivityLogService claimTicketActivityLogService;
    private final ClaimTicketWorkFlowService claimTicketWorkFlowService;
    private final UserRepository userRepository;
    private final ClaimTicketAssignLogRepository claimTicketAssignLogRepository;

    public ClaimTicketService(ProvinceRepository provinceRepository, CityRepository cityRepository, OrganizationRepository organizationRepository, ClaimTypeRepository claimTypeRepository, ClaimSubTypeRepository claimSubTypeRepository, ClaimTicketRepository claimTicketRepository, UserService userService, UserClaimTicketMapper userClaimTicketMapper, AuditLogService auditLogService, Gson gson, MessageSource messageSource, ClaimTicketMapper claimTicketMapper, DocumentService documentService, ClaimTicketDocumentRepository claimTicketDocumentRepository, ClaimTicketStatusLogRepository claimTicketStatusLogRepository, ClaimTicketInstanceLogRepository claimTicketInstanceLogRepository, ClaimTicketPriorityLogRepository claimTicketPriorityLogRepository, EnumUtil enumUtil, ClaimTicketActivityLogService claimTicketActivityLogService, ClaimTicketWorkFlowService claimTicketWorkFlowService, UserRepository userRepository, ClaimTicketAssignLogRepository claimTicketAssignLogRepository) {
        this.provinceRepository = provinceRepository;
        this.cityRepository = cityRepository;
        this.organizationRepository = organizationRepository;
        this.claimTypeRepository = claimTypeRepository;
        this.claimSubTypeRepository = claimSubTypeRepository;
        this.claimTicketRepository = claimTicketRepository;
        this.userService = userService;
        this.userClaimTicketMapper = userClaimTicketMapper;
        this.auditLogService = auditLogService;
        this.gson = new GsonBuilder()
            .registerTypeAdapter(Instant.class, new InstantTypeAdapter())
            .create();
        this.messageSource = messageSource;
        this.claimTicketMapper = claimTicketMapper;
        this.documentService = documentService;
        this.claimTicketDocumentRepository = claimTicketDocumentRepository;
        this.claimTicketStatusLogRepository = claimTicketStatusLogRepository;
        this.claimTicketInstanceLogRepository = claimTicketInstanceLogRepository;
        this.claimTicketPriorityLogRepository = claimTicketPriorityLogRepository;
        this.enumUtil = enumUtil;
        this.claimTicketActivityLogService = claimTicketActivityLogService;
        this.claimTicketWorkFlowService = claimTicketWorkFlowService;
        this.userRepository = userRepository;
        this.claimTicketAssignLogRepository = claimTicketAssignLogRepository;
    }


    public ClaimTicketResponseDTO createClaimTicket(@Valid CreateClaimTicketRequest claimTicketRequest,
                                                    HttpServletRequest request) {
        return null;
    }
}
