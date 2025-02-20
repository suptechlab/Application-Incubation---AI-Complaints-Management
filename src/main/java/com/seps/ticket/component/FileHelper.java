package com.seps.ticket.component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;


@Component
public class FileHelper {
    private static final Logger log = LoggerFactory.getLogger(FileHelper.class);
    // Constants for Image MIME Types
    public static final String IMAGE_JPEG = "image/jpeg";
    public static final String IMAGE_JPG = "image/jpg";
    public static final String IMAGE_PNG = "image/png";
    public static final String PDF = "application/pdf";
    public static final String TEXT_PLAIN = "text/plain";
    public static final String DOC = "application/msword"; // Microsoft Word 97-2003 document
    public static final String DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; // Microsoft Word Open XML document
    public static final String RTF = "application/rtf"; // Rich Text Format document


    // Enum for different File Types
    public enum FileType {
        CLAIM_TICKET_DOCUMENTS("document", null, new String[]{IMAGE_JPEG, IMAGE_JPG, IMAGE_PNG, PDF, DOC, DOCX, RTF, TEXT_PLAIN}, 1024 * 10.1); // 1MB
        private final String folderPath;
        private final String thumbnailFolderPath;
        private final String[] validMimeTypes;
        private final Double validFileSize; // In bytes

        FileType(String folderPath, String thumbnailFolderPath, String[] validMimeTypes, Double validFileSize) {
            this.folderPath = folderPath;
            this.thumbnailFolderPath = thumbnailFolderPath;
            this.validMimeTypes = validMimeTypes;
            this.validFileSize = validFileSize;
        }

        public String getFolderPath() {
            return folderPath;
        }

        public String getThumbnailFolderPath() {
            return thumbnailFolderPath;
        }

        public String[] getValidMimeTypes() {
            return validMimeTypes;
        }

        public Double getValidFileSize() {
            return validFileSize;
        }
    }

    // Constructor
    public FileHelper() {
    }

    // Get folder path for a given FileType
    public String getFolderPath(FileType fileType) {
        return fileType.getFolderPath();
    }

    // Get thumbnail folder path for a given FileType
    public String getThumbnailFolderPath(FileType fileType) {
        return fileType.getThumbnailFolderPath();
    }

    // Get valid MIME types for a given FileType
    public String[] getValidMimeType(FileType fileType) {
        return fileType.getValidMimeTypes();
    }

    // Get the valid file size for a given FileType
    public Double getValidFileSize(FileType fileType) {
        return fileType.getValidFileSize();
    }
}
