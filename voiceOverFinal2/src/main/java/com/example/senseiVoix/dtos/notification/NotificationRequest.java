package com.example.senseiVoix.dtos.notification;

import com.example.senseiVoix.enumeration.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {
    private String title;
    private String message;
    private NotificationType type;
    private String recipientUuid;
    private String relatedEntityId;
    private String relatedEntityType;
    private String actionUrl;
    private String metadata;
    private boolean sendPush = true;
}
