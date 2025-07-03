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
public class    PaymentController {
    @Autowired
    private StripeService stripeService;

    @Autowired
    private ClientRepository userRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaiementService paymentService;

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayementsEnAttente() {
        return ResponseEntity.ok(paymentService.getAllPayements());
    }


}

