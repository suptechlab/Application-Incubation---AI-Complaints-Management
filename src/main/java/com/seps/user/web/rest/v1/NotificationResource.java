package com.seps.user.web.rest.v1;

import com.seps.user.service.NotificationService;
import com.seps.user.service.dto.UserNotificationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationResource {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<List<UserNotificationDTO>> getUserNotifications(Pageable pageable) {
        Page<UserNotificationDTO> page = notificationService.getUserNotifications(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @PostMapping("/{notificationId}/mark-as-read")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/mark-as-read-all")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<Void> markAsReadAll() {
        notificationService.markAsReadAll();
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{notificationId}")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotificationById(notificationId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete/all")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<Void> deleteNotificationAll() {
        notificationService.deleteAllNotifications();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/count")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<Map<String,String>> countNotificationAll() {
        Map<String, String> count = notificationService.countAllNotifications();
        return ResponseEntity.ok(count);
    }
}

