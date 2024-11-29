package com.seps.ticket.service.dto;

public class ConsultationRequest {
    private String identificacion;
    private String individualDactilar;

    // Getters and setters
    public String getIdentificacion() {
        return identificacion;
    }

    public void setIdentificacion(String identificacion) {
        this.identificacion = identificacion;
    }

    public String getIndividualDactilar() {
        return individualDactilar;
    }

    public void setIndividualDactilar(String individualDactilar) {
        this.individualDactilar = individualDactilar;
    }
}
