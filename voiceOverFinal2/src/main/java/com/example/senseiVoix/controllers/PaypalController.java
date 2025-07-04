package com.example.senseiVoix.controllers;

import com.example.senseiVoix.services.serviceImp.PaypalService;
import com.paypal.api.payments.Links;
import com.paypal.api.payments.Payment;
import com.paypal.base.rest.PayPalRESTException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
public class PaypalController {
    @Autowired
    private  PaypalService paypalService;



    @PostMapping("/payment/create")
    public ResponseEntity<?> createPayment(
            @RequestParam("method") String method,
            @RequestParam("amount") String amount,
            @RequestParam("currency") String currency,
            @RequestParam("description") String description,
            @RequestParam("clientUuid") String clientUuid
    ) {
        try {
            String cancelUrl = "https://api.castingvoixoff.ma/payment/cancel";
            String successUrl = "https://api.castingvoixoff.ma/payment/success";
            Payment payment = paypalService.createPayment(
                    Double.valueOf(amount),
                    currency,
                    method,
                    "sale",
                    description,
                    cancelUrl,
                    successUrl,
                    clientUuid
            );

            for (Links links: payment.getLinks()) {
                if (links.getRel().equals("approval_url")) {
                    return ResponseEntity.ok(links.getHref()); // Send URL as JSON instead of redirecting
                }
            }
        } catch (PayPalRESTException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing payment");
        }
        return ResponseEntity.badRequest().body("Payment error");
    }


    @GetMapping("/payment/success")
    public String paymentSuccess(
            @RequestParam("paymentId") String paymentId,
            @RequestParam("PayerID") String payerId
    ) {
        try {
            Payment payment = paypalService.executePayment(paymentId, payerId);
            if (payment.getState().equals("approved")) {
                return "paymentSuccess";
            }
        } catch (PayPalRESTException e) {
            throw new RuntimeException(e);
        }
        return "paymentSuccess";
    }

    @GetMapping("/payment/cancel")
    public String paymentCancel() {
        return "paymentCancel";
    }

    @GetMapping("/payment/error")
    public String paymentError() {
        return "paymentError";
    }

    @PostMapping("/payment/payout")
    public ResponseEntity<?> sendPayout(
            @RequestParam("recipientEmail") String recipientEmail,
            @RequestParam("amount") String amount,
            @RequestParam("currency") String currency,
            @RequestParam("note") String note,
            @RequestParam("senderUuid") String senderUuid
    ) {
        try {
            String batchId = paypalService.sendMoneyThroughPayouts(
                    recipientEmail,
                    Double.valueOf(amount),
                    currency,
                    note,
                    senderUuid
            );

            // If we get here, the payout was successfully initiated
            return ResponseEntity.ok("Payout initiated with batch ID: " + batchId);
        } catch (PayPalRESTException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error sending payout: " + e.getMessage());
        }
    }
}
