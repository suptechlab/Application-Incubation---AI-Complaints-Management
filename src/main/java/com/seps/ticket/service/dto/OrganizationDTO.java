package com.seps.ticket.service.dto;

import lombok.Data;

import static com.seps.ticket.component.CommonHelper.capitalizeCustom;

@Data
public class OrganizationDTO {
    private Long id;
    private String ruc;                // RUC
    private String razonSocial;        // Corporate Name
    private String nemonicoTipoOrganizacion; // Mnemonic Type Code
    private String tipoOrganizacion;   // Type of Organization

    // Custom setter for `razonSocial`
    public void setRazonSocial(String razonSocial) {
        this.razonSocial = capitalizeCustom(razonSocial);
    }
}
