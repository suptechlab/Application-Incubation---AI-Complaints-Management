package com.seps.auth.service.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class MailDTO {

    private String templateKey;
    private String locale;
    private String to;
    private Map<String, String> dataVariables;
    private List<Attachment> attachments;


    public record Attachment(String filename, java.io.File file) {

    }
}
