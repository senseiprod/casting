package com.example.senseiVoix.entities;

import com.example.senseiVoix.enumeration.NotificationStatus;
import com.example.senseiVoix.enumeration.NotificationType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification extends BaseModel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, length = 1000)
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status = NotificationStatus.UNREAD;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    @JsonIgnore
    private Utilisateur recipient;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    @JsonIgnore
    private Utilisateur sender;
    
    @Column(name = "related_entity_id")
    private String relatedEntityId;
    
    @Column(name = "related_entity_type")
    private String relatedEntityType;
    
    @Column(name = "action_url")
    private String actionUrl;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    @Column(name = "is_push_sent")
    private boolean isPushSent = false;
    
    @Column(name = "push_sent_at")
    private LocalDateTime pushSentAt;
    
    // Additional metadata as JSON string
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;
    
    public void markAsRead() {
        this.status = NotificationStatus.UNREAD;
        this.readAt = LocalDateTime.now();
    }
    
    public void markAsPushSent() {
        this.isPushSent = true;
        this.pushSentAt = LocalDateTime.now();
    }
}
