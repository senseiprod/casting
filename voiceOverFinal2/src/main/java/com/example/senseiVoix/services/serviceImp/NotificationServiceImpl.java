package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.notification.NotificationRequest;
import com.example.senseiVoix.dtos.notification.NotificationResponse;
import com.example.senseiVoix.dtos.notification.PushSubscriptionRequest;
import com.example.senseiVoix.entities.Admin;
import com.example.senseiVoix.entities.Notification;
import com.example.senseiVoix.entities.PushSubscription;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.enumeration.NotificationStatus;
import com.example.senseiVoix.enumeration.NotificationType;
import com.example.senseiVoix.enumeration.RoleUtilisateur;
import com.example.senseiVoix.repositories.AdminRepository;
import com.example.senseiVoix.repositories.NotificationRepository;
import com.example.senseiVoix.repositories.PushSubscriptionRepository;
import com.example.senseiVoix.repositories.UtilisateurRepository;
import com.example.senseiVoix.services.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.PushService;
import org.jose4j.lang.JoseException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final AdminRepository adminRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${app.vapid.public-key:}")
    private String vapidPublicKey;

    @Value("${app.vapid.private-key:}")
    private String vapidPrivateKey;

    @Value("${app.vapid.subject:mailto:admin@castingvoixoff.ma}")
    private String vapidSubject;

    private PushService pushService;

    @PostConstruct
    public void init() throws IOException {
        if (!vapidPublicKey.isEmpty() && !vapidPrivateKey.isEmpty()) {
            try {
                pushService = new PushService(vapidPublicKey, vapidPrivateKey, vapidSubject);
            } catch (GeneralSecurityException e) {
                log.error("Failed to initialize push service", e);
            }
        } else {
            log.warn("VAPID keys not configured, push notifications will be disabled");
        }
    }

    @Override
    public Notification createNotification(NotificationRequest request) {
        Utilisateur recipient = utilisateurRepository.findByUuid(request.getRecipientUuid());
        if (recipient == null) {
            throw new RuntimeException("Recipient not found");
        }

        Notification notification = new Notification();
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setType(request.getType());
        notification.setRecipient(recipient);
        notification.setRelatedEntityId(request.getRelatedEntityId());
        notification.setRelatedEntityType(request.getRelatedEntityType());
        notification.setActionUrl(request.getActionUrl());
        notification.setMetadata(request.getMetadata());

        Notification notification1 = notificationRepository.save(notification);

        // Send real-time notification via WebSocket
        sendWebSocketNotification(notification);

        // Send push notification if requested
        if (request.isSendPush()) {
            CompletableFuture.runAsync(() -> {
                try {
                    sendPushNotification(notification1);
                } catch (ExecutionException | InterruptedException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
            });
        }

        return notification;
    }

    @Override
    public Notification createNotification(String title, String message, NotificationType type, Utilisateur recipient) {
        return createNotification(title, message, type, recipient, null);
    }

    @Override
    public Notification createNotification(String title, String message, NotificationType type, Utilisateur recipient, Utilisateur sender) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRecipient(recipient);
        notification.setSender(sender);

        Notification notification1 = notificationRepository.save(notification);

        // Send real-time notification via WebSocket
        sendWebSocketNotification(notification);

        // Send push notification
        CompletableFuture.runAsync(() -> {
            try {
                sendPushNotification(notification1);
            } catch (ExecutionException | InterruptedException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        });

        return notification;
    }

    @Override
    public Page<NotificationResponse> getUserNotifications(String userUuid, Pageable pageable) {
        Utilisateur user = utilisateurRepository.findByUuid(userUuid);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Page<Notification> notifications = notificationRepository.findByRecipientAndDeletedFalseOrderByCreatedAtDesc(user, pageable);
        return notifications.map(this::convertToResponse);
    }

    @Override
    public Page<NotificationResponse> getFilteredNotifications(String userUuid, NotificationType type, NotificationStatus status, Pageable pageable) {
        Utilisateur user = utilisateurRepository.findByUuid(userUuid);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Page<Notification> notifications = notificationRepository.findFilteredNotifications(user, type, status, pageable);
        return notifications.map(this::convertToResponse);
    }

    @Override
    public List<NotificationResponse> getRecentNotifications(String userUuid, int hours) {

        Utilisateur user = utilisateurRepository.findByUuid(userUuid);


        if (user == null) {

            throw new RuntimeException("User not found");
        }


        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        List<Notification> notifications = notificationRepository.findRecentNotifications(user, since);
        return notifications.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public long getUnreadCount(String userUuid) {
        Utilisateur user = utilisateurRepository.findByUuid(userUuid);
        if (user == null) {
            return 0;
        }
        return notificationRepository.countByRecipientAndStatus(user, NotificationStatus.UNREAD);
    }

    @Override
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.markAsRead();
        notificationRepository.save(notification);

        // Send WebSocket update
        sendWebSocketNotification(notification);
    }

    @Override
    public void markAllAsRead(String userUuid) {
        Utilisateur user = utilisateurRepository.findByUuid(userUuid);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        notificationRepository.markAllAsReadForUser(user, NotificationStatus.READ, LocalDateTime.now());

        // Send WebSocket update for unread count
        messagingTemplate.convertAndSendToUser(userUuid, "/queue/notifications/count", 0);
    }

    @Override
    public void deleteNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setDeleted(true);
        notificationRepository.save(notification);
    }

    @Override
    public void subscribeToPush(String userUuid, PushSubscriptionRequest request) {
        Utilisateur user = utilisateurRepository.findByUuid(userUuid);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Check if subscription already exists
        var existingSubscription = pushSubscriptionRepository.findByUserAndEndpoint(user, request.getEndpoint());
        if (existingSubscription.isPresent()) {
            PushSubscription subscription = existingSubscription.get();
            subscription.setActive(true);
            subscription.setLastUsedAt(LocalDateTime.now());
            pushSubscriptionRepository.save(subscription);
            return;
        }

        // Create new subscription
        PushSubscription subscription = new PushSubscription();
        subscription.setUser(user);
        subscription.setEndpoint(request.getEndpoint());
        subscription.setP256dhKey(request.getP256dhKey());
        subscription.setAuthKey(request.getAuthKey());
        subscription.setUserAgent(request.getUserAgent());
        subscription.setActive(true);

        pushSubscriptionRepository.save(subscription);
        log.info("Push subscription created for user: {}", userUuid);
    }

    @Override
    public void unsubscribeFromPush(String userUuid, String endpoint) {
        Utilisateur user = utilisateurRepository.findByUuid(userUuid);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        var subscription = pushSubscriptionRepository.findByUserAndEndpoint(user, endpoint);
        if (subscription.isPresent()) {
            PushSubscription pushSubscription = subscription.get();
            pushSubscription.setActive(false);
            pushSubscriptionRepository.save(pushSubscription);
            log.info("Push subscription deactivated for user: {}", userUuid);
        }
    }

    @Override
    public void sendPushNotification(Notification notification) throws ExecutionException, InterruptedException {
        if (pushService == null) {
            log.warn("Push service not initialized, skipping push notification");
            return;
        }

        List<PushSubscription> subscriptions = pushSubscriptionRepository.findByUserAndIsActiveTrue(notification.getRecipient());
        
        for (PushSubscription subscription : subscriptions) {
            try {
                nl.martijndwars.webpush.Notification pushNotification = new nl.martijndwars.webpush.Notification(
                    subscription.getEndpoint(),
                    subscription.getP256dhKey(),
                    subscription.getAuthKey(),
                    createPushPayload(notification)
                );

                pushService.send(pushNotification);
                subscription.setLastUsedAt(LocalDateTime.now());
                pushSubscriptionRepository.save(subscription);
                
                log.info("Push notification sent successfully to user: {}", notification.getRecipient().getUuid());
                
            } catch (GeneralSecurityException | IOException | JoseException e) {
                log.error("Failed to send push notification to user: {}", notification.getRecipient().getUuid(), e);
                // Deactivate subscription if it's invalid
                subscription.setActive(false);
                pushSubscriptionRepository.save(subscription);
            }
        }

        // Mark notification as push sent
        notification.markAsPushSent();
        notificationRepository.save(notification);
    }

    @Override
    public void sendPushToUser(String userUuid, String title, String message) throws ExecutionException, InterruptedException {
        Utilisateur user = utilisateurRepository.findByUuid(userUuid);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Notification notification = createNotification(title, message, NotificationType.SYSTEM_NOTIFICATION, user);
        sendPushNotification(notification);
    }

    @Override
    public void sendPushToAll(String title, String message) throws ExecutionException, InterruptedException {
        List<PushSubscription> allSubscriptions = pushSubscriptionRepository.findAllActiveSubscriptions();
        
        for (PushSubscription subscription : allSubscriptions) {
            try {
                nl.martijndwars.webpush.Notification pushNotification = new nl.martijndwars.webpush.Notification(
                    subscription.getEndpoint(),
                    subscription.getP256dhKey(),
                    subscription.getAuthKey(),
                    String.format("{\"title\":\"%s\",\"body\":\"%s\",\"icon\":\"/icon.png\"}", title, message)
                );

                pushService.send(pushNotification);
                subscription.setLastUsedAt(LocalDateTime.now());
                pushSubscriptionRepository.save(subscription);
                
            } catch (GeneralSecurityException | IOException | JoseException e) {
                log.error("Failed to send broadcast push notification", e);
                subscription.setActive(false);
                pushSubscriptionRepository.save(subscription);
            }
        }
    }

    // Business logic notification methods
    @Override
    public void notifyUserRegistration(Utilisateur user) {
        createNotification(
            "Bienvenue sur SenseiVoix!",
            "Votre compte a été créé avec succès. Vérifiez votre email pour activer votre compte.",
            NotificationType.USER_REGISTRATION,
            user
        );
    }

    @Override
    public void notifyEmailVerification(Utilisateur user) {
        createNotification(
            "Email vérifié",
            "Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant utiliser toutes les fonctionnalités.",
            NotificationType.EMAIL_VERIFICATION,
            user
        );
    }

    @Override
    public void notifyActionCreated(Utilisateur user, String actionId) {
        createNotification(
            "Nouvelle action créée",
            "Votre demande de génération audio a été créée et est en cours de traitement.",
            NotificationType.ACTION_CREATED,
            user
        );
    }

    @Override
    public void notifyPaymentSuccess(Utilisateur user, String actionId, double amount) {
        createNotification(
            "Paiement confirmé",
            String.format("Votre paiement de %.2f€ a été confirmé. La génération audio va commencer.", amount),
            NotificationType.PAYMENT_SUCCESS,
            user
        );
    }

    @Override
    public void notifyPaymentFailed(Utilisateur user, String actionId, String reason) {
        createNotification(
            "Échec du paiement",
            "Votre paiement a échoué: " + reason + ". Veuillez réessayer.",
            NotificationType.PAYMENT_FAILED,
            user
        );
    }

    @Override
    public void notifyAudioGenerated(Utilisateur user, String actionId) {
        createNotification(
            "Audio généré",
            "Votre fichier audio a été généré avec succès et est maintenant disponible au téléchargement.",
            NotificationType.AUDIO_GENERATED,
            user
        );
    }

    @Override
    public void notifyAudioGenerationFailed(Utilisateur user, String actionId, String reason) {
        createNotification(
            "Échec de génération",
            "La génération de votre audio a échoué: " + reason + ". Contactez le support si le problème persiste.",
            NotificationType.AUDIO_GENERATION_FAILED,
            user
        );
    }

    @Override
    public void notifyAdminValidationRequired(String actionId, String libelle) {
        // Notify all admins
        List<Admin> admins = adminRepository.findAll();
        for (Admin admin : admins) {
            createNotification(
                "Validation requise",
                String.format("Un virement bancaire nécessite une validation (Libellé: %s)", libelle),
                NotificationType.ADMIN_VALIDATION_REQUIRED,
                admin
            );
        }
    }

    @Override
    public void notifyBankTransferValidated(Utilisateur user, String actionId) {
        createNotification(
            "Virement validé",
            "Votre virement bancaire a été validé. La génération audio va commencer.",
            NotificationType.BANK_TRANSFER_VALIDATED,
            user
        );
    }

    @Override
    public void notifyBankTransferRejected(Utilisateur user, String actionId, String reason) {
        createNotification(
            "Virement rejeté",
            "Votre virement bancaire a été rejeté: " + reason,
            NotificationType.BANK_TRANSFER_REJECTED,
            user
        );
    }

    @Override
    public void notifyProjectCreated(Utilisateur user, String projectId) {
        createNotification(
            "Projet créé",
            "Votre nouveau projet a été créé avec succès.",
            NotificationType.PROJECT_CREATED,
            user
        );
    }

    @Override
    public void notifyBalanceUpdated(Utilisateur user, double newBalance) {
        createNotification(
            "Solde mis à jour",
            String.format("Votre solde a été mis à jour. Nouveau solde: %.2f€", newBalance),
            NotificationType.BALANCE_UPDATED,
            user
        );
    }

    @Override
    public void notifyReservationCreated(Utilisateur user, String reservationId) {
        createNotification(
            "Réservation créée",
            "Votre réservation a été créée et est en attente de confirmation.",
            NotificationType.RESERVATION_CREATED,
            user
        );
    }

    @Override
    public void notifyReservationConfirmed(Utilisateur user, String reservationId) {
        createNotification(
            "Réservation confirmée",
            "Votre réservation a été confirmée.",
            NotificationType.RESERVATION_CONFIRMED,
            user
        );
    }

    @Override
    public void notifyReservationCancelled(Utilisateur user, String reservationId) {
        createNotification(
            "Réservation annulée",
            "Votre réservation a été annulée.",
            NotificationType.RESERVATION_CANCELLED,
            user
        );
    }

    // Helper methods
    private void sendWebSocketNotification(Notification notification) {
        try {
            NotificationResponse response = convertToResponse(notification);
            messagingTemplate.convertAndSendToUser(
                notification.getRecipient().getUuid(),
                "/queue/notifications",
                response
            );

            // Also send unread count update
            long unreadCount = getUnreadCount(notification.getRecipient().getUuid());
            messagingTemplate.convertAndSendToUser(
                notification.getRecipient().getUuid(),
                "/queue/notifications/count",
                unreadCount
            );
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification", e);
        }
    }

    private String createPushPayload(Notification notification) {
        return String.format(
            "{\"title\":\"%s\",\"body\":\"%s\",\"icon\":\"/icon.png\",\"badge\":\"/badge.png\",\"data\":{\"notificationId\":%d,\"type\":\"%s\"}}",
            notification.getTitle(),
            notification.getMessage(),
            notification.getId(),
            notification.getType()
        );
    }

    private NotificationResponse convertToResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setUuid(notification.getUuid());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType());
        response.setStatus(notification.getStatus());
        response.setRelatedEntityId(notification.getRelatedEntityId());
        response.setRelatedEntityType(notification.getRelatedEntityType());
        response.setActionUrl(notification.getActionUrl());
        response.setCreatedAt(notification.getCreatedAt());
        response.setReadAt(notification.getReadAt());
        response.setMetadata(notification.getMetadata());
        
        if (notification.getSender() != null) {
            response.setSenderName(notification.getSender().getNom() + " " + notification.getSender().getPrenom());
        }
        
        return response;
    }
}
