package com.seps.ticket.service.dto;

import com.seps.ticket.enums.DocumentSourceEnum;
import com.seps.ticket.enums.InstanceTypeEnum;
import com.seps.ticket.enums.UserStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserClaimTicketDocumentDTO {
    private Long id; // Unique identifier
    private Long claimTicketId; // ID of the associated claim ticket
    private ClaimTicketDTO claimTicket;
    private String externalDocumentId; // External reference for the document
    private String originalTitle; // Title of the document
    private DocumentSourceEnum source; // Source of the document (enum)
    private InstanceTypeEnum instanceType; // Instance type for the document (enum)
    private Long uploadedBy; // ID of the user who uploaded the document
    private UserDTO uploadedByUser;
    private Instant uploadedAt; // Timestamp of when the document was uploaded

    // Optionally, you can include the claimTicket or uploadedByUser as full objects if needed
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDTO implements Serializable {
        private Long id;
        private String name;
        private String email;
        private String langKey;
        private UserStatusEnum status;
        private Set<String> authorities;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClaimTicketDTO implements Serializable {
        private Long id;
        private Long ticketId;
    }
}
