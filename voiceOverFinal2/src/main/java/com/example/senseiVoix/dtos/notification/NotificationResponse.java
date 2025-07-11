package com.example.senseiVoix.dtos.notification;

import com.example.senseiVoix.enumeration.NotificationStatus;
import com.example.senseiVoix.enumeration.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String uuid;
    private String title;
    private String message;
    private NotificationType type;
    private NotificationStatus status;
    private String senderName;
    private String relatedEntityId;
    private String relatedEntityType;
    private String actionUrl;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private String metadata;
}
