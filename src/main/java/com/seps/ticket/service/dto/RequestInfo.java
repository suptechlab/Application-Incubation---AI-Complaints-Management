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
    private String userAgent;

    public RequestInfo(HttpServletRequest httpServletRequest) {
        this.method = httpServletRequest.getMethod();
        this.requestURI = httpServletRequest.getRequestURI();
        this.queryString = httpServletRequest.getQueryString();
        // Retrieve the client IP address
        String clientIP = httpServletRequest.getHeader("X-Forwarded-For");
        if (clientIP == null || clientIP.isEmpty() || "unknown".equalsIgnoreCase(clientIP)) {
            clientIP = httpServletRequest.getHeader("X-Real-IP");
        }
        if (clientIP == null || clientIP.isEmpty() || "unknown".equalsIgnoreCase(clientIP)) {
            clientIP = httpServletRequest.getRemoteAddr();
        }
        this.remoteAddr = clientIP;
        this.remoteUser = httpServletRequest.getRemoteUser();
        this.remoteHost = httpServletRequest.getRemoteHost();
        this.remotePort = httpServletRequest.getRemotePort();
        this.userAgent = httpServletRequest.getHeader("user-agent");
        if (this.userAgent == null) {
            this.userAgent = "unknown";
        }
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
            0, // No remote port,
            ""
        );
    }
}
