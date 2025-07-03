package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.Payment;
import com.example.senseiVoix.enumeration.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    @Query("SELECT c FROM Payment  c WHERE c.utilisateur.uuid =:uuid")
    Payment findByActionUuid(@Param("uuid") String client);
}
