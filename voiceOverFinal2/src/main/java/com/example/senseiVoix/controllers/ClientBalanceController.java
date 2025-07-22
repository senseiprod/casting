package com.example.senseiVoix.controllers;

import com.example.senseiVoix.dtos.action.BankTransferResponse;
import com.example.senseiVoix.services.serviceImp.PaiementService;
import com.example.senseiVoix.services.serviceImp.PaypalService;
import com.paypal.api.payments.Payment;
import com.paypal.base.rest.PayPalRESTException;

import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class ClientBalanceController {

    @Autowired
    private PaiementService paiementService;
    @Autowired
    private PaypalService paypalService;

    // Set balance manually (e.g., by admin)
    @GetMapping("/balance/success/{uuid}/{balance}")
    public void setBalance(
            @PathVariable String uuid,
            @PathVariable double balance,
            @RequestParam("paymentId") String paymentId,
            @RequestParam("PayerID") String payerId,
            HttpServletResponse response) throws IOException {
        try {

            Payment payment = paypalService.executePayment2(paymentId, payerId);
            paiementService.setBalanceClient(uuid, balance);
            response.sendRedirect("https://castingvoixoff.ma/speakerDasboard/"+uuid+"/charge-success/"+balance+"/"+balance);
        } catch (Exception e) {
            response.sendRedirect("https://your-redirect-url.com/error?message=" + URLEncoder.encode(e.getMessage(), "UTF-8"));
        }
    }
    

    // Start PayPal recharge process
    @PostMapping("/charge-balance")
    public ResponseEntity<Map<String, String>> chargeBalance(
            @RequestParam String uuid,
            @RequestParam double amount) throws IOException {
        try {
            String paymentRedirectUrl = paiementService.chargeBalanceClient(uuid, amount);

            Map<String, String> response = new HashMap<>();
            response.put("redirectUrl", paymentRedirectUrl);

            return ResponseEntity.ok(response);

        } catch (PayPalRESTException e) {
            return ResponseEntity.status(HttpServletResponse.SC_BAD_REQUEST)
                    .body(Map.of("error", "PayPal Error: " + e.getMessage()));
        }
    }

        @PostMapping("/create")
    public BankTransferResponse createBankTransfer(
            @RequestParam("uuid") String uuid,
            @RequestParam("price") double price) {

        return paiementService.createBankTransferResponse(uuid, price);
    }
}
