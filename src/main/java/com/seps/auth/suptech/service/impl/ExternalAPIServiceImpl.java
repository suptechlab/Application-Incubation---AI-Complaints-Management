package com.seps.auth.suptech.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seps.auth.service.dto.ConsultationRequest;
import com.seps.auth.suptech.service.ExternalAPIService;
import com.seps.auth.suptech.service.PersonNotFoundException;
import com.seps.auth.suptech.service.PersonValidationException;
import com.seps.auth.suptech.service.dto.PersonInfoDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
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
                throw new RuntimeException("Se esperaba una respuesta JSON pero se recibió un formato no compatible.");
            }
            // Parse JSON response
            JsonNode jsonResponse;
            try {
                jsonResponse = objectMapper.readTree(response.getBody());
            } catch (JsonProcessingException e) {
                LOG.error("Error parsing JSON response: {}", response.getBody(), e);
                throw new RuntimeException("Expected JSON response but received unsupported formatInvalid JSON response from external API", e);
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
            throw new RuntimeException("Se produjo un error al llamar a la API de información personal", e);
        }
    }


    @Override
    public Boolean validateIndividualPerson(ConsultationRequest request) {
        String identificacion = request.getIdentificacion();
        String individualDactilar = request.getIndividualDactilar();
        String url = "http://sca.seps.local/seps-consulta/consultaDinardap/validarPersonaIndividual";
        String requestBody = String.format(
            "{\"identificacion\":\"%s\",\"individualDactilar\":\"%s\"}",
            identificacion, individualDactilar);
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            if (!response.getHeaders().getContentType().toString().contains("application/json")) {
                LOG.error("Unexpected response format: {}", response.getBody());
                throw new RuntimeException("Se esperaba una respuesta JSON pero se recibió un formato no compatible.");
            }
            JsonNode jsonResponse = objectMapper.readTree(response.getBody());
            if (jsonResponse.has("status") && "Succefull".equals(jsonResponse.get("status").asText())) {
                return true; // Successful validation
            } else {
                String errorMessage = jsonResponse.has("message") ? jsonResponse.get("message").asText() : "Validación fallida.";
                throw new PersonValidationException(errorMessage);
            }
        } catch (HttpClientErrorException e) {
            LOG.error("HTTP client error: {}", e.getMessage());
            String responseBody = e.getResponseBodyAsString();
            try {
                JsonNode errorResponse = objectMapper.readTree(responseBody);
                String errorMessage = errorResponse.has("message") ? errorResponse.get("message").asText() : "Validación fallida";
                throw new PersonValidationException(errorMessage);
            } catch (JsonProcessingException ex) {
                throw new RuntimeException("Error al analizar la respuesta de error: " + responseBody, ex);
            }
        } catch (Exception e) {
            LOG.error("Unexpected error during validation", e);
            throw new RuntimeException("Se produjo un error al validar la persona individual: ", e);
        }
    }
}
