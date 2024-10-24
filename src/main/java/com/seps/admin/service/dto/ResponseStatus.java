package com.seps.admin.service.dto;

import lombok.Data;

@Data
public class ResponseStatus {

    private String message;
    private int status;
    private Long timeStamp;

    public ResponseStatus() {
        super();
    }

    public ResponseStatus(String message, int status, Long timeStamp) {
        super();
        this.message = message;
        this.status = status;
        this.timeStamp = timeStamp;
    }
}
