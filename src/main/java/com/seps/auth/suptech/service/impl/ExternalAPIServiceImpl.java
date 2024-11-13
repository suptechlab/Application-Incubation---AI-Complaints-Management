package com.seps.auth.suptech.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seps.auth.service.UserService;
import com.seps.auth.suptech.service.ExternalAPIService;
import com.seps.auth.suptech.service.OrganizationNotFoundException;
import com.seps.auth.suptech.service.PersonNotFoundException;
import com.seps.auth.suptech.service.dto.OrganizationInfoDTO;
import com.seps.auth.suptech.service.dto.PersonInfoDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
public class ExternalAPIServiceImpl implements ExternalAPIService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final Logger LOG = LoggerFactory.getLogger(ExternalAPIServiceImpl.class);

    @Override
    public PersonInfoDTO getPersonInfo(String identificacion) {
        String url = "http://sca.seps.local/seps-consulta/consultaDinardap/obtenerInformacionPersona?identificacion=" + identificacion;
        try {
            LOG.debug("Requesting URL: {}", url);
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            LOG.debug("Response Status: {}, Headers: {}", response.getStatusCode(), response.getHeaders());
            // Check if Content-Type is JSON
            if (!response.getHeaders().getContentType().toString().contains("application/json")) {
                LOG.error("Unexpected response format: {}", response.getBody());
                throw new RuntimeException("Expected JSON response but received HTML or other format.");
            }
            // Parse JSON response
            JsonNode jsonResponse;
            try {
                jsonResponse = objectMapper.readTree(response.getBody());
            } catch (JsonProcessingException e) {
                LOG.error("Error parsing JSON response: {}", response.getBody(), e);
                throw new RuntimeException("Invalid JSON response from external API", e);
            }
            // Check response status
            if (jsonResponse.has("status") && "Succefull".equals(jsonResponse.get("status").asText())) {
                JsonNode objectNode = jsonResponse.get("object");
                // Map JSON to PersonInfoDTO
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
            // Handle 4xx client errors
            if (e.getStatusCode().is4xxClientError()) {
                throw new PersonNotFoundException("Person with ID " + identificacion + " not found.");
            } else {
                LOG.error("API request failed with status: {}", e.getStatusCode());
                throw new RuntimeException("API request failed with status: " + e.getStatusCode(), e);
            }
        } catch (Exception e) {
            LOG.error("Unexpected error while calling external API", e);
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
