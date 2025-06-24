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
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/actions")
@CrossOrigin(origins = "*")
public class ActionController {

    @Autowired
    private ActionServiceImpl actionService;

    @Autowired
    private PaypalService paypalService;

    // Temporary storage for voice IDs during payment flow
    private final Map<Long, String> tempVoiceStorage = new ConcurrentHashMap<>();

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

    // NEW TTS WORKFLOW ENDPOINTS

    @PostMapping("/create-action")
    public ResponseEntity<Map<String, Object>> createAction(@RequestBody ActionRequest actionRequest) {
        try {
            // Step 1: Create and save initial action
            Action action = actionService.createInitialAction(actionRequest);

            // Step 2: Store voice ID temporarily for later use
            tempVoiceStorage.put(action.getId(), actionRequest.getVoiceUuid());

            // Step 3: Calculate price based on text length
            double price = actionService.calculatePrice(actionRequest.getText());

            // Ensure minimum amount for PayPal (must be at least $0.01)
            if (price < 0.01) {
                price = 0.01;
            }

            Map<String, Object> response = new HashMap<>();
            response.put("actionId", action.getId());
            response.put("price", price);

            try {
                // Step 4: Create PayPal payment
                Payment payment = paypalService.createPayment(
                        price,
                        "USD",
                        "Text-to-Speech Generation",
                        "http://localhost:8080/api/actions/payment/cancel/" + action.getId(),
                        "http://localhost:8080/api/actions/payment/success/" + action.getId()
                );

                response.put("paymentId", payment.getId());

                // Get approval URL for frontend redirect
                String approvalUrl = payment.getLinks().stream()
                        .filter(link -> link.getRel().equals("approval_url"))
                        .findFirst()
                        .map(link -> link.getHref())
                        .orElse("");

                response.put("approvalUrl", approvalUrl);

            } catch (PayPalRESTException paypalError) {
                // If PayPal fails, still return the action but indicate PayPal error
                response.put("paypalError", paypalError.getMessage());
                response.put("message", "Action created but PayPal payment failed: " + paypalError.getMessage());

                // For testing, provide a direct test URL
                response.put("testUrl", "http://localhost:8080/api/actions/test-success/" + action.getId());
            }

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
            @RequestParam("PayerID") String payerId) {

        try {
            // Execute PayPal payment
            Payment payment = paypalService.executePayment(paymentId, payerId);

            if (payment.getState().equals("approved")) {
                // Get voice ID from temporary storage
                String voiceId = tempVoiceStorage.get(actionId);
                if (voiceId == null) {
                    voiceId = "21m00Tcm4TlvDq8ikWAM"; // Default fallback voice ID
                }

                // Generate audio and update action
                Action updatedAction = actionService.generateAudioAndUpdateAction(actionId, voiceId);

                // Clean up temporary storage
                tempVoiceStorage.remove(actionId);

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Payment successful and audio generated");
                response.put("actionId", updatedAction.getId());
                response.put("status", updatedAction.getStatutAction());
                response.put("voiceIdUsed", voiceId);

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Payment not approved"));
            }

        } catch (Exception e) {
            // Clean up temporary storage on error
            tempVoiceStorage.remove(actionId);
            return ResponseEntity.badRequest().body(Map.of("error", "Payment execution failed: " + e.getMessage()));
        }
    }

    @GetMapping("/payment/cancel/{actionId}")
    public ResponseEntity<Map<String, Object>> paymentCancel(@PathVariable Long actionId) {
        try {
            // Clean up temporary storage
            tempVoiceStorage.remove(actionId);

            // Cancel the action
            actionService.cancelAction(actionId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Payment cancelled");
            response.put("actionId", actionId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to cancel action: " + e.getMessage()));
        }
    }

    // Test endpoint for when PayPal fails
    @GetMapping("/test-success/{actionId}")
    public ResponseEntity<Map<String, Object>> testSuccess(@PathVariable Long actionId) {
        try {
            // Get voice ID from temporary storage
            String voiceId = tempVoiceStorage.get(actionId);
            if (voiceId == null) {
                voiceId = "21m00Tcm4TlvDq8ikWAM"; // Default fallback voice ID
            }

            // Generate audio directly without PayPal
            Action updatedAction = actionService.generateAudioAndUpdateAction(actionId, voiceId);

            // Clean up temporary storage
            tempVoiceStorage.remove(actionId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Audio generated successfully (PayPal bypassed for testing)");
            response.put("actionId", updatedAction.getId());
            response.put("status", updatedAction.getStatutAction());
            response.put("voiceIdUsed", voiceId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Clean up temporary storage on error
            tempVoiceStorage.remove(actionId);
            return ResponseEntity.badRequest().body(Map.of("error", "Audio generation failed: " + e.getMessage()));
        }
    }

    // Utility endpoint to check temporary storage (for debugging)
    @GetMapping("/debug/voice-storage")
    public ResponseEntity<Map<String, Object>> debugVoiceStorage() {
        Map<String, Object> response = new HashMap<>();
        response.put("tempVoiceStorage", tempVoiceStorage);
        response.put("storageSize", tempVoiceStorage.size());
        return ResponseEntity.ok(response);
    }

    // Utility endpoint to clear temporary storage (for debugging)
    @PostMapping("/debug/clear-voice-storage")
    public ResponseEntity<Map<String, Object>> clearVoiceStorage() {
        int clearedCount = tempVoiceStorage.size();
        tempVoiceStorage.clear();

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Voice storage cleared");
        response.put("clearedCount", clearedCount);
        return ResponseEntity.ok(response);
    }
}