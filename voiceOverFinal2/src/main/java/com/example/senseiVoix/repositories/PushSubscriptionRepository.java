package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.PushSubscription;
import com.example.senseiVoix.entities.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    
    List<PushSubscription> findByUserAndIsActiveTrue(Utilisateur user);
    
    Optional<PushSubscription> findByEndpointAndDeletedFalse(String endpoint);
    
    @Query("SELECT ps FROM PushSubscription ps WHERE ps.user = :user AND ps.endpoint = :endpoint AND ps.deleted = false")
    Optional<PushSubscription> findByUserAndEndpoint(@Param("user") Utilisateur user, @Param("endpoint") String endpoint);
    
    @Modifying
    @Query("UPDATE PushSubscription ps SET ps.isActive = false WHERE ps.user = :user")
    void deactivateAllForUser(@Param("user") Utilisateur user);
    
    @Query("SELECT ps FROM PushSubscription ps WHERE ps.isActive = true AND ps.deleted = false")
    List<PushSubscription> findAllActiveSubscriptions();
    
    long countByUserAndIsActiveTrueAndDeletedFalse(Utilisateur user);
}
