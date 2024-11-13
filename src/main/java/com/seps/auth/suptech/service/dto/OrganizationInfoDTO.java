package com.seps.auth.suptech.service.dto;

public class OrganizationInfoDTO {
    private String ruc;
    private String razonSocial;
    private String nemonicoTipoOrganizacion;
    private String tipoOrganizacion;

    // Constructors, getters, and setters
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
}
