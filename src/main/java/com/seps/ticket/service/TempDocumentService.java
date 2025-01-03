package com.seps.ticket.service;

import com.seps.ticket.domain.*;
import com.seps.ticket.repository.*;
import com.seps.ticket.suptech.service.DocumentService;
import com.seps.ticket.suptech.service.FileStorageException;
import com.seps.ticket.suptech.service.InvalidFileTypeException;
import com.seps.ticket.web.rest.errors.CustomException;
import com.seps.ticket.web.rest.errors.SepsStatusCode;
import com.seps.ticket.web.rest.vm.*;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;
import org.zalando.problem.Status;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;


@Service
public class TempDocumentService {
    private static final Logger LOG = LoggerFactory.getLogger(TempDocumentService.class);

    private final UserService userService;
    private final MessageSource messageSource;
    private final DocumentService documentService;
    private final TempDocumentRepository tempDocumentRepository;

    public TempDocumentService(UserService userService, MessageSource messageSource, DocumentService documentService, TempDocumentRepository tempDocumentRepository) {
        this.userService = userService;
        this.messageSource = messageSource;
        this.documentService = documentService;
        this.tempDocumentRepository = tempDocumentRepository;
    }

    public List<TempDocument> uploadFileAttachments(List<MultipartFile> attachments, User currentUser) {
        LOG.debug("attachments size:{}", attachments.size());
        List<TempDocument> claimTicketDocuments = new ArrayList<>();
        // Handle file uploads and create documents
        if (!CollectionUtils.isEmpty(attachments)) {
            for (MultipartFile file : attachments) {
                try {
                    // Generate a unique file name for storage
                    String uniqueFileName = documentService.generateUniqueFileName(file.getOriginalFilename());
                    // Get the original file name, trimmed to fit within 255 characters and replace spaces with underscores
                    String originalFileName = documentService.fitFileNameToMaxLength(file.getOriginalFilename());
                    // Upload the document and get the external document ID
                    String tempClaimTd = "0";
                    ResponseEntity<String> response = documentService.uploadDocument(file.getBytes(), tempClaimTd, uniqueFileName);
                    String externalDocumentId = response.getBody();  // Assuming the response body contains the externalDocumentId
                    // Create a ClaimTicketDocument and add to the list
                    TempDocument claimTicketDocument = new TempDocument();
                    claimTicketDocument.setExternalDocumentId(externalDocumentId);
                    claimTicketDocument.setTitle(uniqueFileName);  // Set the appropriate title (can customize as needed)
                    claimTicketDocument.setOriginalTitle(originalFileName);
                    claimTicketDocument.setUploadedBy(currentUser.getId());
                    // Add the document to the list
                    claimTicketDocuments.add(claimTicketDocument);
                } catch (InvalidFileTypeException e) {
                    LOG.error("InvalidFileTypeException while uploadDocument:{}", e.getMessage());
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.FILE_STORAGE_ERROR, e.getMessage());
                } catch (FileStorageException e) {
                    LOG.error("Exception while uploadDocument:{}", e.getMessage());
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.FILE_STORAGE_ERROR, e.getMessage());
                } catch (IOException e) {
                    LOG.error("IOException while uploadDocument:{}", e.getMessage());
                    throw new CustomException(Status.BAD_REQUEST, SepsStatusCode.FILE_STORAGE_ERROR, e.getMessage());
                } catch (Exception e) {
                    String errorMessage = messageSource.getMessage("error.file.upload.unexpected", null, LocaleContextHolder.getLocale());
                    // Catch any other unexpected exceptions
                    throw new CustomException(Status.INTERNAL_SERVER_ERROR, SepsStatusCode.FILE_STORAGE_ERROR, errorMessage);
                }
            }
        }
        return claimTicketDocuments;
    }


    @Transactional
    public ResponseEntity<String> uploadDocument(@Valid TempUploadDocumentRequest request) {
        User currentUser = userService.getCurrentUser();
        List<TempDocument> tempDocumentList = uploadFileAttachments(request.getAttachments(), currentUser);
        tempDocumentRepository.saveAll(tempDocumentList);
        LOG.debug("Uploaded files: {}", tempDocumentList);

        if (tempDocumentList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("No document uploaded");
        }

        // Generate a comma-separated string of externalDocumentId
        String externalDocumentIds = tempDocumentList.stream()
            .map(TempDocument::getExternalDocumentId)
            .collect(Collectors.joining(","));

        return ResponseEntity.ok(externalDocumentIds);
    }


}
