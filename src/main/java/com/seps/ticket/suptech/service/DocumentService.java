package com.seps.ticket.suptech.service;

import org.springframework.http.ResponseEntity;

public interface DocumentService {

    ResponseEntity<String> uploadDocument(byte[] bytes, String idTicket, String uniqueFileName);

    ResponseEntity<byte[]> downloadDocument(String documentId);

    String generateUniqueFileName(String originalFileName);

    String fitFileNameToMaxLength(String originalFileName);

    String downloadAndUploadDocument(String documentId, String claimTicketId, String fileName);
}
