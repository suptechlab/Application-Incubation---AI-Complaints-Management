package com.seps.ticket.service;

import com.seps.ticket.domain.*;
import com.seps.ticket.enums.ClaimTicketPriorityEnum;
import com.seps.ticket.enums.ClaimTicketStatusEnum;
import com.seps.ticket.repository.*;
import com.seps.ticket.service.dto.ClaimTicketResponseDTO;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import com.seps.ticket.web.rest.vm.ClaimTicketRequest;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zalando.problem.Status;

import java.time.Instant;
import java.util.List;

@Service
public class UserClaimTicketService {

    private final ProvinceRepository provinceRepository;
    private final CityRepository cityRepository;
    private final OrganizationRepository organizationRepository;
    private final ClaimTypeRepository claimTypeRepository;
    private final ClaimSubTypeRepository claimSubTypeRepository;
    private final ClaimTicketRepository claimTicketRepository;
    private final UserService userService;

    public UserClaimTicketService(ProvinceRepository provinceRepository, CityRepository cityRepository,
                                  OrganizationRepository organizationRepository, ClaimTypeRepository claimTypeRepository,
                                  ClaimSubTypeRepository claimSubTypeRepository, ClaimTicketRepository claimTicketRepository, UserService userService) {
        this.provinceRepository = provinceRepository;
        this.cityRepository = cityRepository;
        this.organizationRepository = organizationRepository;
        this.claimTypeRepository = claimTypeRepository;
        this.claimSubTypeRepository = claimSubTypeRepository;
        this.claimTicketRepository = claimTicketRepository;
        this.userService = userService;
    }


    /**
     * Handles the process of filing a claim ticket.
     *
     * <p>This method performs the following operations:
     * <ul>
     *   <li>Validates if a duplicate claim ticket exists for the user based on the provided parameters.</li>
     *   <li>If no duplicate is found, it validates and fetches related entities such as Province, City, Organization, ClaimType, and ClaimSubType.</li>
     *   <li>Generates a unique ticket ID and saves a new claim ticket with the provided details.</li>
     * </ul>
     *
     * @param claimTicketRequest the request payload containing claim ticket details.
     * @return {@link ClaimTicketResponseDTO} containing information about the filed claim,
     * including whether a duplicate was found and the new ticket ID (if created).
     * @throws CustomException if any validation fails for the provided input.
     */
    @Transactional
    public ClaimTicketResponseDTO fileClaim(@Valid ClaimTicketRequest claimTicketRequest) {
        User currentUser = userService.getCurrentUser();
        Long currentUserId = currentUser.getId();
        ClaimTicketResponseDTO responseDTO = new ClaimTicketResponseDTO();
        responseDTO.setCheckDuplicate(claimTicketRequest.getCheckDuplicate());
        // Check for duplicate tickets
        if (Boolean.TRUE.equals(claimTicketRequest.getCheckDuplicate())) {
            List<ClaimTicket> duplicateTickets = claimTicketRepository.findByUserIdAndClaimTypeIdAndClaimSubTypeIdAndOrganizationId(
                currentUserId,
                claimTicketRequest.getClaimTypeId(),
                claimTicketRequest.getClaimSubTypeId(),
                claimTicketRequest.getOrganizationId()
            );

            if (!duplicateTickets.isEmpty()) {
                ClaimTicket duplicateTicket = duplicateTickets.stream().findAny().get();
                responseDTO.setFoundDuplicate(true);
                responseDTO.setDuplicateTicketId(duplicateTicket.getTicketId());
                return responseDTO;
            }
        }
        responseDTO.setFoundDuplicate(false);
        // Fetch and validate associated entities
        Province province = provinceRepository.findById(claimTicketRequest.getProvinceId())
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.PROVINCE_NOT_FOUND, null, null));

        City city = cityRepository.findByIdAndProvinceId(claimTicketRequest.getCityId(), claimTicketRequest.getProvinceId())
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CITY_NOT_FOUND, null, null));

        Organization organization = organizationRepository.findById(claimTicketRequest.getOrganizationId())
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.ORGANIZATION_NOT_FOUND, null, null));

        ClaimType claimType = claimTypeRepository.findById(claimTicketRequest.getClaimTypeId())
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_TYPE_NOT_FOUND, null, null));

        ClaimSubType claimSubType = claimSubTypeRepository.findByIdAndClaimTypeId(claimTicketRequest.getClaimSubTypeId(), claimTicketRequest.getClaimTypeId())
            .orElseThrow(() -> new CustomException(Status.BAD_REQUEST, SepsStatusCode.CLAIM_SUB_TYPE_NOT_FOUND, null, null));

        // Create and save the new claim ticket
        ClaimTicket newClaimTicket = new ClaimTicket();
        newClaimTicket.setTicketId(generateTicketId());
        newClaimTicket.setUser(currentUser);
        newClaimTicket.setProvince(province);
        newClaimTicket.setCity(city);
        newClaimTicket.setOrganization(organization);
        newClaimTicket.setClaimType(claimType);
        newClaimTicket.setClaimSubType(claimSubType);
        newClaimTicket.setPriorityCareGroup(claimTicketRequest.getPriorityCareGroup());
        newClaimTicket.setCustomerType(claimTicketRequest.getCustomerType());
        newClaimTicket.setPrecedents(claimTicketRequest.getPrecedents());
        newClaimTicket.setSpecificPetition(claimTicketRequest.getSpecificPetition());
        newClaimTicket.setPriority(ClaimTicketPriorityEnum.MEDIUM);
        newClaimTicket.setSlaBreachDays(claimSubType.getSlaBreachDays());
        newClaimTicket.setStatus(ClaimTicketStatusEnum.NEW);
        newClaimTicket.setCreatedByUser(currentUser);
        claimTicketRepository.save(newClaimTicket);
        // Populate response
        responseDTO.setNewTicketId(newClaimTicket.getTicketId());
        responseDTO.setEmail(currentUser.getEmail());
        return responseDTO;
    }

    /**
     * Generates a unique ticket ID based on the current Unix timestamp.
     *
     * @return a 10-digit ticket ID
     */
    public Long generateTicketId() {
        return Instant.now().getEpochSecond();
    }
}
