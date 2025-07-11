package com.example.senseiVoix.services;

import com.example.senseiVoix.dtos.notification.NotificationRequest;
import com.example.senseiVoix.dtos.notification.NotificationResponse;
import com.example.senseiVoix.dtos.notification.PushSubscriptionRequest;
import com.example.senseiVoix.entities.Notification;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.enumeration.NotificationStatus;
import com.example.senseiVoix.enumeration.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.concurrent.ExecutionException;

public interface NotificationService {
    
    // Core notification methods
    Notification createNotification(NotificationRequest request);
    Notification createNotification(String title, String message, NotificationType type, Utilisateur recipient);
    Notification createNotification(String title, String message, NotificationType type, Utilisateur recipient, Utilisateur sender);
    
    // Get notifications
    Page<NotificationResponse> getUserNotifications(String userUuid, Pageable pageable);
    Page<NotificationResponse> getFilteredNotifications(String userUuid, NotificationType type, NotificationStatus status, Pageable pageable);
    List<NotificationResponse> getRecentNotifications(String userUuid, int hours);
    long getUnreadCount(String userUuid);
    
    // Mark notifications
    void markAsRead(Long notificationId);
    void markAllAsRead(String userUuid);
    void deleteNotification(Long notificationId);
    
    // Push subscription management
    void subscribeToPush(String userUuid, PushSubscriptionRequest request);
    void unsubscribeFromPush(String userUuid, String endpoint);
    void sendPushNotification(Notification notification) throws ExecutionException, InterruptedException;
    void sendPushToUser(String userUuid, String title, String message) throws ExecutionException, InterruptedException;
    void sendPushToAll(String title, String message) throws ExecutionException, InterruptedException;
    
    // Business logic notifications
    void notifyUserRegistration(Utilisateur user);
    void notifyEmailVerification(Utilisateur user);
    void notifyActionCreated(Utilisateur user, String actionId);
    void notifyPaymentSuccess(Utilisateur user, String actionId, double amount);
    void notifyPaymentFailed(Utilisateur user, String actionId, String reason);
    void notifyAudioGenerated(Utilisateur user, String actionId);
    void notifyAudioGenerationFailed(Utilisateur user, String actionId, String reason);
    void notifyAdminValidationRequired(String actionId, String libelle);
    void notifyBankTransferValidated(Utilisateur user, String actionId);
    void notifyBankTransferRejected(Utilisateur user, String actionId, String reason);
    void notifyProjectCreated(Utilisateur user, String projectId);
    void notifyBalanceUpdated(Utilisateur user, double newBalance);
    void notifyReservationCreated(Utilisateur user, String reservationId);
    void notifyReservationConfirmed(Utilisateur user, String reservationId);
    void notifyReservationCancelled(Utilisateur user, String reservationId);
}
