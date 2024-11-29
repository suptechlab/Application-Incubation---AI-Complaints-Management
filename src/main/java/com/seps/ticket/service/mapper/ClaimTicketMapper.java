package com.seps.ticket.service.mapper;

import com.seps.ticket.domain.Authority;
import com.seps.ticket.domain.ClaimTicket;
import com.seps.ticket.domain.ClaimTicketDocument;
import com.seps.ticket.domain.User;
import com.seps.ticket.service.dto.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {ProvinceMapper.class, CityMapper.class, ClaimTypeMapper.class, ClaimSubTypeMapper.class})
public interface ClaimTicketMapper {

    @Mapping(source = "user", target = "user")
    @Mapping(source = "fiAgent", target = "fiAgent")
    @Mapping(source = "createdByUser", target = "createdByUser")
    @Mapping(source = "updatedByUser", target = "updatedByUser")
    @Mapping(source = "claimTicketDocuments", target = "claimTicketDocuments")
        // Add this line to map the documents
    ClaimTicketDTO toDTO(ClaimTicket claimTicket);

    // Map authorities to string set
    default Set<String> mapAuthorities(Set<Authority> authorities) {
        if (authorities == null) {
            return null; // Handle null gracefully
        }
        return authorities.stream()
            .map(Authority::getName) // Ensure Authority has a getName() method
            .collect(Collectors.toSet());
    }

    // Map User entity to UserDTO
    @Mapping(target = "authorities", expression = "java(mapAuthorities(user.getAuthorities()))")
    @Mapping(source = "firstName", target = "name")
    UserDTO toUserDTO(User user);

    // Map FIUser entity to FIUserDTO
    @Mapping(target = "authorities", expression = "java(mapAuthorities(user.getAuthorities()))")
    @Mapping(source = "firstName", target = "name")
    FIUserDTO toFIUserDTO(User user);

    // Map ClaimTicketDocument to ClaimTicketDocumentDTO
    List<ClaimTicketDocumentDTO> toClaimTicketDocumentDTOs(List<ClaimTicketDocument> claimTicketDocuments);

}
