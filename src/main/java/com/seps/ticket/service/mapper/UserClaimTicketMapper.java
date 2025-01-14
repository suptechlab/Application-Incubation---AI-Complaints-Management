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
public interface UserClaimTicketMapper {

    @Mapping(source = "user", target = "user")
    @Mapping(source = "fiAgent", target = "fiAgent")
    @Mapping(source = "createdByUser", target = "createdByUser")
    @Mapping(source = "updatedByUser", target = "updatedByUser")
    @Mapping(source = "claimTicketDocuments", target = "claimTicketDocuments")
    @Mapping(source = "previousTicket", target = "previousTicket") // Map the previous ticket
    UserClaimTicketDTO toUserClaimTicketDTO(ClaimTicket claimTicket);

    // Map User to UserDTO
    default UserClaimTicketDTO.UserDTO mapUserToUserDTO(User user) {
        if (user == null) {
            return null;
        }
        UserClaimTicketDTO.UserDTO userDTO = new UserClaimTicketDTO.UserDTO();
        userDTO.setId(user.getId());
        userDTO.setName(user.getFirstName());
        userDTO.setEmail(user.getEmail());
        userDTO.setLangKey(user.getLangKey());
        userDTO.setStatus(user.getStatus());
        return userDTO;
    }

    // Map User to FIUserDTO
    default UserClaimTicketDTO.FIUserDTO mapUserToFIUserDTO(User user) {
        if (user == null) {
            return null;
        }
        UserClaimTicketDTO.FIUserDTO fiUserDTO = new UserClaimTicketDTO.FIUserDTO();
        fiUserDTO.setId(user.getId());
        fiUserDTO.setName(user.getFirstName());
        fiUserDTO.setEmail(user.getEmail());
        fiUserDTO.setLangKey(user.getLangKey());
        fiUserDTO.setStatus(user.getStatus());
        if (user.getOrganization() != null) {
            fiUserDTO.setOrganizationId(user.getOrganizationId());
            fiUserDTO.setRuc(user.getOrganization().getRuc());
            fiUserDTO.setRazonSocial(user.getOrganization().getRazonSocial());
        }
        return fiUserDTO;
    }


    default UserClaimTicketDocumentDTO.UserDTO mapUserToUserDocumentDTO(User user) {
        if (user == null) {
            return null;
        }
        UserClaimTicketDocumentDTO.UserDTO userDTO = new UserClaimTicketDocumentDTO.UserDTO();
        userDTO.setId(user.getId());
        userDTO.setName(user.getFirstName());
        userDTO.setEmail(user.getEmail());
        userDTO.setLangKey(user.getLangKey());
        userDTO.setStatus(user.getStatus());
        userDTO.setAuthorities(mapAuthoritiesToStrings(user.getAuthorities()));
        return userDTO;
    }

    // Map ClaimTicketDocument to ClaimTicketDocumentDTO
    List<UserClaimTicketDocumentDTO> toClaimTicketDocumentDTOs(List<ClaimTicketDocument> claimTicketDocuments);

    // Helper method to map Set<Authority> to Set<String>
    default Set<String> mapAuthoritiesToStrings(Set<Authority> authorities) {
        if (authorities == null) {
            return null;
        }
        return authorities.stream()
            .map(Authority::getName)
            .collect(Collectors.toSet());
    }

}
