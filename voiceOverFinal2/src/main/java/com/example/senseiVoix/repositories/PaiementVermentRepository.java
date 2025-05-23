package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.PaiementVerment;
import com.example.senseiVoix.enumeration.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PaiementVermentRepository extends JpaRepository<PaiementVerment, Long> {
    @Query("SELECT c FROM PaiementVerment  c WHERE c.utilisateur.uuid =:uuid AND c.status =:status")
    PaiementVerment findFirstByClientAndStatus(@Param("uuid") String client, @Param("status") PaymentStatus paymentStatus);
    @Query("SELECT c FROM PaiementVerment  c WHERE c.utilisateur.uuid =:uuid ")
    PaiementVerment findByUuid(@Param("uuid") String paiementId);
    @Query("SELECT c FROM PaiementVerment  c WHERE c.status =:status")
    List<PaiementVerment> findByStatut(@Param("status") PaymentStatus paymentStatus);
}
