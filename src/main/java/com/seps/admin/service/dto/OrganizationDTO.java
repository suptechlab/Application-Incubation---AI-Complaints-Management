package com.seps.admin.service.dto;

import lombok.Data;

import java.time.Instant;

import static com.seps.admin.component.CommonHelper.capitalizeCustom;

@Data
public class OrganizationDTO {
    private Long id;
    private String ruc;                // RUC
    private String razonSocial;        // Corporate Name
    private String nemonicoTipoOrganizacion; // Mnemonic Type Code
    private String tipoOrganizacion;   // Type of Organization
    private Long createdBy;
    private Instant createdAt;
    private Long updatedBy;
    private Instant updatedAt;

    // Custom setter for `razonSocial`
    public void setRazonSocial(String razonSocial) {
        this.razonSocial = capitalizeCustom(razonSocial);
    }


}
