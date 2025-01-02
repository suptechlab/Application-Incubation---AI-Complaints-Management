package com.seps.user.suptech.service.impl;

import com.seps.user.suptech.service.DocumentService;
import com.seps.user.suptech.service.FileStorageException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class DocumentServiceImpl implements DocumentService {

    private static final Logger LOG = LoggerFactory.getLogger(DocumentServiceImpl.class);

    @Autowired
    private MessageSource messageSource;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String uploadApiUrl = "https://srvrestdesa-app.seps.gob.ec/repositorio-documental/docuware/publico/cargar-archivo-suptech";
    private static final String downloadApiUrl = "https://srvrestdesa-app.seps.gob.ec/repositorio-documental/docuware/publico/descargar-documento-suptech";
    private static final String PROFILE_TRANSACTION_TYPE = "PROFILE";
    private static final int MAX_FILE_NAME_LENGTH = 254;

    public ResponseEntity<String> upload(byte[] fileBytes, String uniqueFileName) {

        Map<String, Object> payload = new HashMap<>();
        payload.put("nombreDocumento", uniqueFileName);
        payload.put("tipoTransaccion", PROFILE_TRANSACTION_TYPE);
        payload.put("fechaCarga", getFormattedTimestamp());
        payload.put("bytesDocumento", fileBytes);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(uploadApiUrl, HttpMethod.POST, entity, String.class);
            // Validate response
            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                String errorMessage = messageSource.getMessage("error.invalid.api.response", null, LocaleContextHolder.getLocale());
                LOG.error("Invalid API response: StatusCode={}, Body={}", response.getStatusCode(), response.getBody());
                throw new FileStorageException(errorMessage);
            }
            return response;
        } catch (Exception ex) {
            LOG.error("Error during uploadDocument: {}", ex.getMessage(), ex);
            String errorMessage = messageSource.getMessage("error.upload.file", new Object[]{ex.getMessage()}, LocaleContextHolder.getLocale());
            throw new FileStorageException(errorMessage, ex);
        }
    }


    public ResponseEntity<byte[]> downloadDocument(String documentId) {
        String requestUrl = downloadApiUrl + "?id-archivo=" + documentId;
        try {
            HttpHeaders requestHeaders = new HttpHeaders();
            requestHeaders.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Void> requestEntity = new HttpEntity<>(requestHeaders);
            ResponseEntity<Map> response = restTemplate.exchange(
                requestUrl, HttpMethod.POST, requestEntity, Map.class
            );
            LOG.debug("Response from external API: {}", response);
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                if (responseBody != null) {
                    String fileName = (String) responseBody.get("nombreDocumento");
                    String base64Data = (String) responseBody.get("bytesDocumento");
                    if (fileName == null || base64Data == null) {
                        String errorMessage = messageSource.getMessage(
                            "error.missing.file.data",
                            null,
                            LocaleContextHolder.getLocale()
                        );
                        throw new IllegalArgumentException(errorMessage);
                    }
                    byte[] fileData = Base64.getDecoder().decode(base64Data);
                    String fileExtension = getFileExtension(fileName);
                    MediaType mediaType = determineMediaType(fileExtension);

                    HttpHeaders headers = new HttpHeaders();
                    headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName);
                    headers.setContentType(mediaType);
                    return new ResponseEntity<>(fileData, headers, HttpStatus.OK);
                }
            }

            String notFoundMessage = messageSource.getMessage(
                "error.file.not.found",
                new Object[]{documentId},
                LocaleContextHolder.getLocale()
            );
            return ResponseEntity.status(response.getStatusCode()).body(notFoundMessage.getBytes());

        } catch (IllegalArgumentException ex) {
            LOG.error("Invalid response from API: {}", ex.getMessage());
            String errorMessage = messageSource.getMessage(
                "error.invalid.response",
                new Object[]{ex.getMessage()},
                LocaleContextHolder.getLocale()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorMessage.getBytes());
        } catch (Exception ex) {
            LOG.error("Error downloading file", ex);
            String errorMessage = messageSource.getMessage(
                "error.download.file",
                new Object[]{ex.getMessage()},
                LocaleContextHolder.getLocale()
            );
            throw new FileStorageException(errorMessage, ex);
        }
    }

    private String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf(".");
        return (dotIndex != -1) ? fileName.substring(dotIndex + 1).toLowerCase() : "";
    }

    private MediaType determineMediaType(String fileExtension) {
        switch (fileExtension) {
            case "jpg":
            case "jpeg":
                return MediaType.IMAGE_JPEG;
            case "png":
                return MediaType.IMAGE_PNG;
            case "txt":
                return MediaType.TEXT_PLAIN;
            case "pdf":
                return MediaType.APPLICATION_PDF;
            case "docx":
                return MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            default:
                return MediaType.APPLICATION_OCTET_STREAM;
        }
    }

    private String getFormattedTimestamp() {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return dateFormat.format(new Date());
    }

    @Override
    public String generateUniqueFileName(String originalFileName) {
        String fileExtension = getFileExtension(originalFileName);
        String uniqueName = UUID.randomUUID() + "_" + System.currentTimeMillis() + "." + fileExtension;
        return uniqueName;
    }

    @Override
    public String fitFileNameToMaxLength(String originalFileName) {
        // Replace spaces with underscores in the file name
        originalFileName = originalFileName.replace(" ", "_");
        // Define the maximum length for the file name
        // Extract file extension if present
        String fileExtension = "";
        int dotIndex = originalFileName.lastIndexOf(".");
        if (dotIndex > 0) {
            fileExtension = originalFileName.substring(dotIndex);
            originalFileName = originalFileName.substring(0, dotIndex);  // Remove extension for now
        }
        // Calculate the byte length of the file name
        int fileNameByteLength = originalFileName.getBytes(StandardCharsets.UTF_8).length;
        // Check if the byte size of the file name exceeds the max length
        if (fileNameByteLength + fileExtension.getBytes(StandardCharsets.UTF_8).length > MAX_FILE_NAME_LENGTH) {
            // Trim the file name to fit within the byte limit, removing characters from the middle
            int availableSpaceForName = MAX_FILE_NAME_LENGTH - fileExtension.getBytes(StandardCharsets.UTF_8).length;
            if (availableSpaceForName > 0) {
                // Ensure that at least part of the original file name is kept
                StringBuilder sb = new StringBuilder();
                int currentByteLength = 0;
                for (int i = 0; i < originalFileName.length(); i++) {
                    String currentChar = String.valueOf(originalFileName.charAt(i));
                    int charByteLength = currentChar.getBytes(StandardCharsets.UTF_8).length;
                    // Only add the character if it fits within the available space
                    if (currentByteLength + charByteLength <= availableSpaceForName) {
                        sb.append(currentChar);
                        currentByteLength += charByteLength;
                    } else {
                        break;
                    }
                }
                originalFileName = sb.toString();
            } else {
                // If the extension itself is too large, reduce the name to just the extension
                originalFileName = fileExtension.substring(0, MAX_FILE_NAME_LENGTH);
            }
        }
        // Return the file name with the extension attached
        return originalFileName + fileExtension;
    }

}
