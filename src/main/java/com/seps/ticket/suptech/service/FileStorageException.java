package com.seps.ticket.suptech.service;

public class FileStorageException extends RuntimeException {
    // Constructor that takes a message and an exception
    public FileStorageException(String message, Exception ex) {
        super(message, ex);  // Pass the message and the exception to the parent constructor
    }

    // Constructor that only takes a message
    public FileStorageException(String message) {
        super(message);
    }
}
