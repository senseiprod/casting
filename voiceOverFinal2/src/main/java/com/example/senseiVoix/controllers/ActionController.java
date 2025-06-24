package com.example.senseiVoix.controllers;

import com.example.senseiVoix.dtos.action.ActionRequest;
import com.example.senseiVoix.dtos.action.ActionResponse;
import com.example.senseiVoix.entities.Action;
import com.example.senseiVoix.services.serviceImp.ActionServiceImpl;
import com.example.senseiVoix.services.serviceImp.PaypalService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.paypal.api.payments.Payment;
import com.paypal.base.rest.PayPalRESTException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/actions")
public class ActionController {

    @Autowired
    private ActionServiceImpl actionService;
    @Autowired
    private PaypalService paypalService;

    @PostMapping("/create")
    public ResponseEntity<?> createAction(
            @RequestParam String text,
            @RequestParam String statutAction,
            @RequestParam String voiceUuid,
            @RequestParam String utilisateurUuid,
            @RequestParam String language,
            @RequestParam String projectUuid,
            @RequestParam("audioGenerated") org.springframework.web.multipart.MultipartFile audioFile
    ) throws java.io.IOException {
         actionService.createAction(text, statutAction, voiceUuid, utilisateurUuid, language, projectUuid, audioFile);
        return ResponseEntity.ok("Action created");
    }


    @PostMapping("/validate/{uuid}")
    public ResponseEntity<?> validateAction(@PathVariable String uuid) {
        try {
            actionService.validateAction(uuid);
            return ResponseEntity.ok("Action validée avec succès");
        } catch (PayPalRESTException | JsonProcessingException e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{uuid}")
    public ResponseEntity<?> deleteAction(@PathVariable String uuid) {
        actionService.deleteAction(uuid);
        return ResponseEntity.ok("Action supprimée avec succès");
    }
    @GetMapping("/by-project/{uuid}")
    public ResponseEntity<List<Action>> getActionsByProject(@PathVariable String uuid) {
        List<Action> actions = actionService.getActionsByProjectUuid(uuid);
        return ResponseEntity.ok(actions);
    }
    @GetMapping("/speaker/{uuid}")
    public ResponseEntity<List<ActionResponse>> getActionBySpeakerUuid(@PathVariable String uuid) {
        List<ActionResponse> action = actionService.getActionBySpeakerUuid(uuid);
        return action != null ? ResponseEntity.ok(action) : ResponseEntity.notFound().build();
    }
    @PostMapping("/notify")
    public ResponseEntity<?> sendNotification(@RequestParam String utilisateurUuid, @RequestParam String speakerUuid, @RequestParam String actionUuid) {
        actionService.sendNotification(utilisateurUuid, speakerUuid, actionUuid);
        return ResponseEntity.ok("Notification envoyée");
    }

    @PostMapping("/reject/{uuid}")
    public ResponseEntity<?> rejectAction(@PathVariable String uuid) {
        try {
            actionService.rejectAction(uuid);
            return ResponseEntity.ok("Action rejetée avec succès");
        } catch (PayPalRESTException e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @PostMapping("/process-payment")
    public ResponseEntity<?> processPayment(@RequestParam String clientUuid, @RequestParam String actionUuid, @RequestParam Double amount, @RequestParam String paypalId, @RequestParam String paypalPayerId) {
        actionService.processPayment(clientUuid, actionUuid, amount, paypalId, paypalPayerId);
        return ResponseEntity.ok("Paiement traité avec succès");
    }


    //changes start here

    @PostMapping("/create-action")
    public ResponseEntity<Map<String, Object>> createAction(@RequestBody ActionRequest actionRequest) {
        try {
            // Step 1: Create and save initial action
            Action action = actionService.createInitialAction(actionRequest);

            // Step 2: Calculate price based on text length
            double price = actionService.calculatePrice(actionRequest.getText());

            // Step 3: Create PayPal payment
            Payment payment = paypalService.createPayment(
                    price,
                    "USD",
                    "Text-to-Speech Generation",
                    "http://localhost:8080/api/actions/payment/cancel/" + action.getId(),
                    "http://localhost:8080/api/actions/payment/success/" + action.getId()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("actionId", action.getId());
            response.put("price", price);
            response.put("paymentId", payment.getId());

            // Get approval URL for frontend redirect
            String approvalUrl = payment.getLinks().stream()
                    .filter(link -> link.getRel().equals("approval_url"))
                    .findFirst()
                    .map(link -> link.getHref())
                    .orElse("");

            response.put("approvalUrl", approvalUrl);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create action: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/payment/success/{actionId}")
    public ResponseEntity<Map<String, Object>> paymentSuccess(
            @PathVariable Long actionId,
            @RequestParam("paymentId") String paymentId,
            @RequestParam("PayerID") String payerId,
            @RequestParam("voiceId") String voiceId) { // Add voice ID parameter

        try {
            // Execute PayPal payment
            Payment payment = paypalService.executePayment(paymentId, payerId);

            if (payment.getState().equals("approved")) {
                // Generate audio and update action - pass voice ID
                Action updatedAction = actionService.generateAudioAndUpdateAction(actionId, voiceId);

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Payment successful and audio generated");
                response.put("actionId", updatedAction.getId());
                response.put("status", updatedAction.getStatutAction());

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Payment not approved"));
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Payment execution failed: " + e.getMessage()));
        }
    }
}
