package com.example.senseiVoix.controllers;

import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.entities.Payment;
import com.example.senseiVoix.enumeration.PaymentStatus;
import com.example.senseiVoix.repositories.ClientRepository;
import com.example.senseiVoix.repositories.PaymentRepository;
import com.example.senseiVoix.services.serviceImp.PaiementService;
import com.example.senseiVoix.services.serviceImp.StripeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin("*")
public class    PaymentController {
    @Autowired
    private StripeService stripeService;

    @Autowired
    private ClientRepository userRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaiementService paymentService;

    @PostMapping("/stripe/{clientId}")
    public ResponseEntity<String> createStripePayment(@PathVariable String clientId, @RequestParam Double amount) {
        Client client = userRepository.findByUuid(clientId);
        // Création de la transaction en statut "PENDING"
        Payment payment = new Payment();
        payment.setUtilisateur(client);
        payment.setAmount(amount);
        payment.setPoints(amount * 10); // Exemple : 1€ = 10 points
        payment.setPaymentMethod("STRIPE");
        payment.setStatus(PaymentStatus.PENDING);
        paymentRepository.save(payment);

        // Génération du lien de paiement Stripe
        String sessionUrl = stripeService.createCheckoutSession(clientId, amount);
        return ResponseEntity.ok(sessionUrl);
    }

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayementsEnAttente() {
        return ResponseEntity.ok(paymentService.getAllPayements());
    }

    @GetMapping("/completed")
    public ResponseEntity<List<Payment>> getAllCompletedPayementsEnAttente() {
        return ResponseEntity.ok(paymentService.getAllCompletedPayements());
    }
}

