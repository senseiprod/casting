package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.Notification;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.enumeration.NotificationStatus;
import com.example.senseiVoix.enumeration.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    Page<Notification> findByRecipientAndDeletedFalseOrderByCreatedAtDesc(Utilisateur recipient, Pageable pageable);
    
    List<Notification> findByRecipientAndStatusAndDeletedFalseOrderByCreatedAtDesc(Utilisateur recipient, NotificationStatus status);
    
    List<Notification> findByRecipientAndTypeAndDeletedFalseOrderByCreatedAtDesc(Utilisateur recipient, NotificationType type);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient = :recipient AND n.status = :status AND n.deleted = false")
    long countByRecipientAndStatus(@Param("recipient") Utilisateur recipient, @Param("status") NotificationStatus status);
    
    @Query("SELECT n FROM Notification n WHERE n.recipient = :recipient AND n.deleted = false AND n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotifications(@Param("recipient") Utilisateur recipient, @Param("since") LocalDateTime since);
    
    @Modifying
    @Query("UPDATE Notification n SET n.status = :status, n.readAt = :readAt WHERE n.recipient = :recipient AND n.status = 'UNREAD' AND n.deleted = false")
    void markAllAsReadForUser(@Param("recipient") Utilisateur recipient, @Param("status") NotificationStatus status, @Param("readAt") LocalDateTime readAt);
    
    @Query("SELECT n FROM Notification n WHERE n.isPushSent = false AND n.deleted = false ORDER BY n.createdAt ASC")
    List<Notification> findUnsentPushNotifications();
    
    List<Notification> findByRelatedEntityIdAndRelatedEntityTypeAndDeletedFalse(String entityId, String entityType);
    
    @Query("SELECT n FROM Notification n WHERE n.recipient = :recipient AND n.deleted = false AND " +
           "(:type IS NULL OR n.type = :type) AND " +
           "(:status IS NULL OR n.status = :status) " +
           "ORDER BY n.createdAt DESC")
    Page<Notification> findFilteredNotifications(@Param("recipient") Utilisateur recipient, 
                                               @Param("type") NotificationType type, 
                                               @Param("status") NotificationStatus status, 
                                               Pageable pageable);
}
