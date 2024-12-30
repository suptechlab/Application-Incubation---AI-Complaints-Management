package com.seps.ticket.service.dto;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestInfo {

    private String method;
    private String requestURI;
    private String queryString;
    private String remoteAddr;
    private String remoteUser;
    private String remoteHost;
    private Integer remotePort;

    public RequestInfo(HttpServletRequest httpServletRequest) {
        this.method = httpServletRequest.getMethod();
        this.requestURI = httpServletRequest.getRequestURI();
        this.queryString = httpServletRequest.getQueryString();
        this.remoteAddr = httpServletRequest.getRemoteAddr();
        this.remoteUser = httpServletRequest.getRemoteUser();
        this.remoteHost = httpServletRequest.getRemoteHost();
        this.remotePort = httpServletRequest.getRemotePort();
    }

    // Factory method for cron jobs
    public static RequestInfo createForCronJob() {
        return new RequestInfo(
            "CRON", // No HTTP method, use "SYSTEM" or "CRON"
            "/cron-job", // Placeholder URI for tracking
            null, // No query string
            "127.0.0.1", // Localhost as the source IP
            "SYSTEM_USER", // Placeholder for system user
            "localhost", // Placeholder for host
            0 // No remote port
        );
    }
}
