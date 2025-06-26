package com.example.senseiVoix.controllers;

import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.entities.Payment;
import com.example.senseiVoix.enumeration.PaymentStatus;
import com.example.senseiVoix.repositories.ClientRepository;
import com.example.senseiVoix.repositories.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class StripeWebhookController {
    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ClientRepository userRepository;

    @PostMapping("/stripe/webhook")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody Map<String, Object> payload) {
        String eventType = (String) payload.get("type");

        if ("checkout.session.completed".equals(eventType)) {
            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            Map<String, Object> object = (Map<String, Object>) data.get("object");
            String clientEmail = (String) object.get("customer_email");

            // Rechercher le client
            Client client = userRepository.findByEmail(clientEmail);

            // Mettre à jour le statut du paiement
            Payment payment = paymentRepository.findFirstByClientAndStatus(client.getUuid(), PaymentStatus.PENDING);

            payment.setStatus(PaymentStatus.COMPLETED);
            client.setBalance(client.getBalance() + payment.getPoints());
            userRepository.save(client);
            paymentRepository.save(payment);
        }

        return ResponseEntity.ok("Webhook reçu");
    }
}
