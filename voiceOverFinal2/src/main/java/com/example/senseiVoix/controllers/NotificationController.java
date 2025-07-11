package com.example.senseiVoix.controllers;

import com.example.senseiVoix.dtos.notification.NotificationRequest;
import com.example.senseiVoix.dtos.notification.NotificationResponse;
import com.example.senseiVoix.dtos.notification.PushSubscriptionRequest;
import com.example.senseiVoix.enumeration.NotificationStatus;
import com.example.senseiVoix.enumeration.NotificationType;
import com.example.senseiVoix.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/user/{userUuid}")
    public ResponseEntity<Page<NotificationResponse>> getUserNotifications(
            @PathVariable String userUuid,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationResponse> notifications = notificationService.getUserNotifications(userUuid, pageable);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userUuid}/filtered")
    public ResponseEntity<Page<NotificationResponse>> getFilteredNotifications(
            @PathVariable String userUuid,
            @RequestParam(required = false) NotificationType type,
            @RequestParam(required = false) NotificationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationResponse> notifications = notificationService.getFilteredNotifications(userUuid, type, status, pageable);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userUuid}/recent")
    public ResponseEntity<List<NotificationResponse>> getRecentNotifications(
            @PathVariable String userUuid,
            @RequestParam(defaultValue = "24") int hours) {
        
        List<NotificationResponse> notifications = notificationService.getRecentNotifications(userUuid, hours);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userUuid}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable String userUuid) {
        long count = notificationService.getUnreadCount(userUuid);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PostMapping
    public ResponseEntity<String> createNotification(@RequestBody NotificationRequest request) {
        try {
            notificationService.createNotification(request);
            return ResponseEntity.ok("Notification created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create notification: " + e.getMessage());
        }
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<String> markAsRead(@PathVariable Long notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            return ResponseEntity.ok("Notification marked as read");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to mark notification as read: " + e.getMessage());
        }
    }

    @PutMapping("/user/{userUuid}/read-all")
    public ResponseEntity<String> markAllAsRead(@PathVariable String userUuid) {
        try {
            notificationService.markAllAsRead(userUuid);
            return ResponseEntity.ok("All notifications marked as read");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to mark all notifications as read: " + e.getMessage());
        }
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<String> deleteNotification(@PathVariable Long notificationId) {
        try {
            notificationService.deleteNotification(notificationId);
            return ResponseEntity.ok("Notification deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete notification: " + e.getMessage());
        }
    }

    // Push notification endpoints
    @PostMapping("/push/subscribe/{userUuid}")
    public ResponseEntity<String> subscribeToPush(
            @PathVariable String userUuid,
            @RequestBody PushSubscriptionRequest request) {
        try {
            notificationService.subscribeToPush(userUuid, request);
            return ResponseEntity.ok("Push subscription created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create push subscription: " + e.getMessage());
        }
    }

    @PostMapping("/push/unsubscribe/{userUuid}")
    public ResponseEntity<String> unsubscribeFromPush(
            @PathVariable String userUuid,
            @RequestParam String endpoint) {
        try {
            notificationService.unsubscribeFromPush(userUuid, endpoint);
            return ResponseEntity.ok("Push subscription removed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to remove push subscription: " + e.getMessage());
        }
    }

    @PostMapping("/push/send/{userUuid}")
    public ResponseEntity<String> sendPushToUser(
            @PathVariable String userUuid,
            @RequestParam String title,
            @RequestParam String message) {
        try {
            notificationService.sendPushToUser(userUuid, title, message);
            return ResponseEntity.ok("Push notification sent successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send push notification: " + e.getMessage());
        }
    }

    @PostMapping("/push/broadcast")
    public ResponseEntity<String> sendPushToAll(
            @RequestParam String title,
            @RequestParam String message) {
        try {
            notificationService.sendPushToAll(title, message);
            return ResponseEntity.ok("Broadcast push notification sent successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send broadcast push notification: " + e.getMessage());
        }
    }
}
