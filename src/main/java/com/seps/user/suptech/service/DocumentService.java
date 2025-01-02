package com.seps.user.suptech.service;

import org.springframework.http.ResponseEntity;

public interface DocumentService {

    ResponseEntity<String> upload(byte[] bytes, String uniqueFileName);

    ResponseEntity<byte[]> downloadDocument(String documentId);

    String generateUniqueFileName(String originalFileName);

    String fitFileNameToMaxLength(String originalFileName);
}
