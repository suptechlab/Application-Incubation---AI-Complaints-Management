package com.seps.auth.service.dto;


import com.seps.auth.domain.Organization;

import java.io.Serializable;
import java.time.Instant;

public class OrganizationDTO implements Serializable {

    private Long id;
    private String ruc;                // RUC
    private String razonSocial;        // Corporate Name
    private String nemonicoTipoOrganizacion; // Mnemonic Type Code
    private String tipoOrganizacion;   // Type of Organization
    private Instant createdAt;
    private Instant updatedAt;

    public OrganizationDTO() {

    }

    public OrganizationDTO(Organization organization) {
        this.id = organization.getId();
        this.ruc = organization.getRuc();
        this.razonSocial = organization.getRazonSocial();
        this.nemonicoTipoOrganizacion = organization.getNemonicoTipoOrganizacion();
        this.tipoOrganizacion = organization.getTipoOrganizacion();
        this.createdAt = organization.getCreatedAt();
        this.updatedAt = organization.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRuc() {
        return ruc;
    }

    public void setRuc(String ruc) {
        this.ruc = ruc;
    }

    public String getRazonSocial() {
        return razonSocial;
    }

    public void setRazonSocial(String razonSocial) {
        this.razonSocial = razonSocial;
    }

    public String getNemonicoTipoOrganizacion() {
        return nemonicoTipoOrganizacion;
    }

    public void setNemonicoTipoOrganizacion(String nemonicoTipoOrganizacion) {
        this.nemonicoTipoOrganizacion = nemonicoTipoOrganizacion;
    }

    public String getTipoOrganizacion() {
        return tipoOrganizacion;
    }

    public void setTipoOrganizacion(String tipoOrganizacion) {
        this.tipoOrganizacion = tipoOrganizacion;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
