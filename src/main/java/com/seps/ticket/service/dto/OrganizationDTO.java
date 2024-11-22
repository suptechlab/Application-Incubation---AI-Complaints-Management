package com.seps.ticket.service.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class OrganizationDTO {
    private Long id;
    private String ruc;                // RUC
    private String razonSocial;        // Corporate Name
    private String nemonicoTipoOrganizacion; // Mnemonic Type Code
    private String tipoOrganizacion;   // Type of Organization
}
