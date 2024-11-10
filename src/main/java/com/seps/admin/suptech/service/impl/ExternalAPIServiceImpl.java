package com.seps.admin.suptech.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seps.admin.suptech.service.OrganizationNotFoundException;
import com.seps.admin.suptech.service.dto.OrganizationInfoDTO;
import com.seps.admin.suptech.service.dto.PersonInfoDTO;
import com.seps.admin.suptech.service.ExternalAPIService;
import com.seps.admin.suptech.service.PersonNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
public class ExternalAPIServiceImpl implements ExternalAPIService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public PersonInfoDTO getPersonInfo(String identificacion) {
        String url = "http://sca.seps.local/seps-consulta/consultaDinardap/obtenerInformacionPersona?identificacion=" + identificacion;
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            // Parse the response as JSON
            JsonNode jsonResponse = objectMapper.readTree(response.getBody());
            // Check the response status and return if successful
            if (jsonResponse.has("status") && "Succefull".equals(jsonResponse.get("status").asText())) {
                JsonNode objectNode = jsonResponse.get("object");
                // Map the JSON to PersonInfoDTO
                PersonInfoDTO personInfo = new PersonInfoDTO();
                personInfo.setIdentificacion(objectNode.get("identificacion").asText());
                personInfo.setNombreCompleto(objectNode.get("nombreCompleto").asText());
                personInfo.setGenero(objectNode.get("genero").asText());
                personInfo.setLugarNacimiento(objectNode.get("lugarNacimiento").asText());
                personInfo.setNacionalidad(objectNode.get("nacionalidad").asText());
                return personInfo;
            } else {
                throw new PersonNotFoundException("Person with ID " + identificacion + " not found.");
            }
        } catch (HttpClientErrorException e) {
            // Handle 4xx errors, assuming person not found
            if (e.getStatusCode().is4xxClientError()) {
                throw new PersonNotFoundException("Person with ID " + identificacion + " not found.");
            } else {
                throw new RuntimeException("API request failed with status: " + e.getStatusCode(), e);
            }
        } catch (Exception e) {
            throw new RuntimeException("An error occurred while calling the external API", e);
        }
    }

    @Override
    public OrganizationInfoDTO getOrganizationInfo(String ruc) {
        String url = "https://srvrestpre-app.seps.gob.ec/organizaciones-sf/obtener-organizacion/publico/obtener-informacion-organizacion-ruc/" + ruc;
        try {
            ResponseEntity<OrganizationInfoDTO> response = restTemplate.getForEntity(url, OrganizationInfoDTO.class);
            return response.getBody();
        } catch (HttpClientErrorException.BadRequest e) {
            throw new OrganizationNotFoundException("No se encontró la entidad para el RUC " + ruc);
        } catch (Exception e) {
            throw new RuntimeException("An error occurred while calling the external API", e);
        }
    }
}
