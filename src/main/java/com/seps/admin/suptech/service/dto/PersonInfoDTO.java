package com.seps.admin.suptech.service.dto;

import lombok.Data;

@Data
public class PersonInfoDTO {
    private String identificacion;
    private String nombreCompleto;
    private String genero;
    private String lugarNacimiento;
    private String nacionalidad;
}
