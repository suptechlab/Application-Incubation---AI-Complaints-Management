package com.seps.admin.suptech.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seps.admin.service.dto.MailDTO;
import com.seps.admin.suptech.service.OrganizationNotFoundException;
import com.seps.admin.suptech.service.dto.OrganizationInfoDTO;
import com.seps.admin.suptech.service.dto.PersonInfoDTO;
import com.seps.admin.suptech.service.ExternalAPIService;
import com.seps.admin.suptech.service.PersonNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExternalAPIServiceImpl implements ExternalAPIService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final Logger LOG = LoggerFactory.getLogger(ExternalAPIServiceImpl.class);

    @Value("${external-api.email-base-url:test}")
    private String emailApiBaseUrl;

    @Value("${external-api.email-from:test}")
    private String emailApiFrom;

    @Value("${external-api.email-service-enable:false}")
    private String emailServiceEnable;

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

    /**
     * Sends an email via an external API.
     *
     * @param mailDTO          The {@link MailDTO} object containing email details, including recipient, CC, and attachments.
     * @param subject          The subject of the email.
     * @param renderedContent  The email content rendered with placeholders replaced.
     * @return                 {@code true} if the email was sent successfully via the external API;
     *                         {@code false} otherwise, either due to API failure or service being disabled.
     *
     * @throws RuntimeException If there is an error reading attachment files.
     */
    @Override
    public Boolean sendEmailViaApi(MailDTO mailDTO, String subject, String renderedContent) {

        if(Boolean.FALSE.equals(Boolean.valueOf(this.emailServiceEnable))){
            return false;
        }

        String url = this.emailApiBaseUrl + "/envio-notificaciones/publico/envio-sin-plantilla";

        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("asunto", subject);
            requestBody.put("remitente", this.emailApiFrom);
            requestBody.put("destinatario", mailDTO.getTo());
            requestBody.put("destinatarioCopia", mailDTO.getCc()); // Add CC recipients if needed
            requestBody.put("reemplazarParametrosPlantilla", renderedContent);

            // Handle attachments
            if (mailDTO.getAttachments() != null && !mailDTO.getAttachments().isEmpty()) {
                List<Map<String, Object>> attachmentList = mailDTO.getAttachments().stream().map(attachment -> {
                    Map<String, Object> attachmentMap = new HashMap<>();
                    attachmentMap.put("nombreAdjunto", attachment.filename());
                    attachmentMap.put("bytesAdjunto", Base64.getEncoder().encodeToString(readFileToByteArray(attachment.file())));
                    return attachmentMap;
                }).toList();
                requestBody.put("listaAdjuntoMail", attachmentList);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");

            HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(requestBody, headers);

            LOG.debug("Sending email request to URL: {}", url);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, httpEntity, String.class);

            LOG.debug("Email API response: Status - {}, Body - {}", response.getStatusCode(), response.getBody());

            if (!response.getStatusCode().is2xxSuccessful()) {
                LOG.error("Failed to send email: {}", response.getBody());
                return false;
            }
            LOG.info("Email sent successfully to recipient: {}", requestBody.get("destinatario"));
            return true;
        } catch (Exception e) {
            LOG.error("Error occurred while sending email via API", e);
            return false;
        }
    }

    /**
     * Reads the content of a file and converts it into a byte array.
     *
     * @param file The {@link java.io.File} to be read.
     * @return     A byte array containing the file's content.
     *
     * @throws RuntimeException If an error occurs while reading the file.
     */
    private byte[] readFileToByteArray(java.io.File file) {
        try {
            return java.nio.file.Files.readAllBytes(file.toPath());
        } catch (Exception e) {
            LOG.error("Error reading file: {}", file.getName(), e);
            throw new RuntimeException("Error reading attachment file: " + file.getName(), e);
        }
    }
}
