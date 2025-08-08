package com.example.senseiVoix.controllers;
import com.example.senseiVoix.dtos.action.ActionDarija;
import com.example.senseiVoix.dtos.action.ActionRequest;
import com.example.senseiVoix.dtos.action.ActionResponse;
import com.example.senseiVoix.dtos.action.BankTransferResponse;
import com.example.senseiVoix.entities.Action;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.enumeration.StatutAction;
import com.example.senseiVoix.repositories.ActionRepository;
import com.example.senseiVoix.services.serviceImp.ActionServiceImpl;
import com.example.senseiVoix.services.serviceImp.PaypalService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.paypal.api.payments.Payment;
import com.paypal.base.rest.PayPalRESTException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ui.Model;
import com.example.senseiVoix.services.NotificationService;
@RestController
@RequestMapping("/api/actions")
@CrossOrigin(origins = "*")
public class ActionController {


    @Value("${app.frontend.url}")
    private String frontendBaseUrl;

    private static final Logger log = LoggerFactory.getLogger(ActionController.class);

    @Autowired
    private ActionServiceImpl actionService;

    @Autowired
    private PaypalService paypalService;

    // Temporary storage for voice IDs during payment flow (BOTH PayPal and Bank Transfer)
    private final Map<Long, String> tempVoiceStorage = new ConcurrentHashMap<>();
    @Autowired
    private ActionRepository actionRepository;

    @Autowired
    private NotificationService notificationService;

    // EXISTING ENDPOINTS (keeping all your existing code)
    // In file: ActionController.java

    @PostMapping("/create")
    public ResponseEntity<ActionResponse> createAction(
            @RequestParam String text,
            @RequestParam String statutAction, // This parameter is unused by the service but kept for API consistency
            @RequestParam String voiceUuid,
            @RequestParam String utilisateurUuid,
            @RequestParam String language,
            @RequestParam String projectUuid,
            @RequestParam("audioGenerated") org.springframework.web.multipart.MultipartFile audioFile
    ) throws java.io.IOException {

        // 1. Call the updated service method to create the action and get the persisted entity
        Action createdAction = actionService.createAction(text, statutAction, voiceUuid, utilisateurUuid, language, projectUuid, audioFile);

        // 2. Create an ActionResponse DTO to send back to the client
        ActionResponse response = new ActionResponse();

        // 3. Map the data from the Action entity to the ActionResponse DTO
        response.setUuid(createdAction.getUuid());
        response.setCode(createdAction.getCode());
        response.setText(createdAction.getText());
        response.setStatutAction(createdAction.getStatutAction());
        response.setLanguage(createdAction.getLanguage());
        response.setActionAccessType(createdAction.getActionAccessType());
        response.setDateCreation(createdAction.getDateCreation());
        response.setAudioGenerated(createdAction.getAudioGenerated());

        // Safely get UUIDs from related objects to avoid NullPointerExceptions
        if (createdAction.getVoice() != null) {
            response.setVoiceUuid(createdAction.getVoice().getUuid());
        }
        if (createdAction.getUtilisateur() != null) {
            response.setUtilisateurUuid(createdAction.getUtilisateur().getUuid());
        }

        // 4. Return the ActionResponse object with a 200 OK status
        return ResponseEntity.ok(response);
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




    // PAYPAL WORKFLOW ENDPOINTS
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
                        "https://api.castingvoixoff.ma/api/actions/payment/cancel/" + action.getId(),
                        "https://api.castingvoixoff.ma/api/actions/payment/success/" + action.getId()
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
                response.put("testUrl", "https://api.castingvoixoff.ma/api/actions/test-success/" + action.getId());
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

                // Send payment success notification
                notificationService.notifyPaymentSuccess(updatedAction.getUtilisateur(), updatedAction.getUuid(), 10);

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

    // NEW BANK TRANSFER ENDPOINTS (FIXED TO MATCH PAYPAL PATTERN)
    @PostMapping("/create-action-bank-transfer")
    public ResponseEntity<BankTransferResponse> createActionWithBankTransfer(@RequestBody ActionRequest actionRequest) {
        try {
            // Step 1: Create and save initial action (same as PayPal)
            Action action = actionService.createInitialAction(actionRequest);

            // Step 2: Store voice ID temporarily for later use (SAME AS PAYPAL)
            tempVoiceStorage.put(action.getId(), actionRequest.getVoiceUuid());

            // Step 3: Generate unique libellé and create bank transfer response
            BankTransferResponse response = actionService.createBankTransferResponse(action, actionRequest.getText());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            BankTransferResponse errorResponse = new BankTransferResponse();
            errorResponse.setMessage("Failed to create action: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // ADMIN ENDPOINTS (UPDATED TO USE TEMP STORAGE)

    @GetMapping("/admin/pending-bank-transfers")
    public ResponseEntity<List<Action>> getPendingBankTransferActions() {
        try {
            List<Action> pendingActions = actionService.getPendingBankTransferActions();
            return ResponseEntity.ok(pendingActions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/admin/validate-bank-transfer/{actionId}")
    public ResponseEntity<Map<String, Object>> validateBankTransferAction(@PathVariable Long actionId) {
        try {
            // Get voice ID from temporary storage (SAME AS PAYPAL)
            String voiceId = tempVoiceStorage.get(actionId);
            if (voiceId == null) {
                voiceId = "21m00Tcm4TlvDq8ikWAM"; // Default fallback voice ID
            }

            // Generate audio and update action (SAME AS PAYPAL)
            Action validatedAction = actionService.generateAudioAndUpdateAction(actionId, voiceId);

            // Clean up temporary storage (SAME AS PAYPAL)
            tempVoiceStorage.remove(actionId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bank transfer validated and audio generated successfully");
            response.put("actionId", validatedAction.getId());
            response.put("status", validatedAction.getStatutAction());
            response.put("libelle", validatedAction.getLibelle());
            response.put("voiceIdUsed", voiceId);

            // Send bank transfer validation notification
            notificationService.notifyBankTransferValidated(validatedAction.getUtilisateur(), validatedAction.getUuid());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Clean up temporary storage on error
            tempVoiceStorage.remove(actionId);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to validate bank transfer: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/admin/reject-bank-transfer/{actionId}")
    public ResponseEntity<Map<String, Object>> rejectBankTransferAction(@PathVariable Long actionId) {
        try {
            // Clean up temporary storage (SAME AS PAYPAL)
            tempVoiceStorage.remove(actionId);

            actionService.rejectBankTransferAction(actionId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bank transfer action rejected successfully");
            response.put("actionId", actionId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Failed to reject bank transfer: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/admin/action-by-libelle/{libelle}")
    public ResponseEntity<Action> getActionByLibelle(@PathVariable String libelle) {
        try {
            Action action = actionService.getActionByLibelle(libelle);
            return action != null ? ResponseEntity.ok(action) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // ###############################################################
    // #################### LAHAJATI WORKFLOW ENDPOINTS ####################
    // ###############################################################

    // --- LAHAJATI PAYPAL WORKFLOW (Mirrors ElevenLabs logic) ---
    @PostMapping("/lahajati/create-action-paypal")
    public ResponseEntity<Map<String, Object>> createLahajatiActionWithPaypal(@RequestBody ActionDarija actionRequest) {
        try {
            // Step 1: Create initial action (generic step)
            Action action = actionService.createInitial(actionRequest);

            // Step 2: Store Lahajati voice ID temporarily
            tempVoiceStorage.put(action.getId(), actionRequest.getVoiceUuid());

            // Step 3: Calculate price (generic step)
            double price = actionService.calculatePrice(actionRequest.getText());
            if (price < 0.01) {
                price = 0.01;
            }

            Map<String, Object> response = new HashMap<>();
            response.put("actionId", action.getId());
            response.put("price", price);

            try {
                // Step 4: Create PayPal payment with Lahajati-specific callback URLs
                Payment payment = paypalService.createPayment(
                        price,
                        "USD",
                        "Lahajati TTS Generation",
                        "https://api.castingvoixoff.ma/api/actions/lahajati/payment/cancel/" + action.getId(),
                        "https://api.castingvoixoff.ma/api/actions/lahajati/payment/success/" + action.getId()
                );

                response.put("paymentId", payment.getId());
                String approvalUrl = payment.getLinks().stream()
                        .filter(link -> "approval_url".equals(link.getRel()))
                        .findFirst()
                        .map(link -> link.getHref())
                        .orElse("");
                response.put("approvalUrl", approvalUrl);

            } catch (PayPalRESTException paypalError) {
                response.put("paypalError", paypalError.getMessage());
                response.put("message", "Action created but PayPal payment for Lahajati failed: " + paypalError.getMessage());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create Lahajati action: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/lahajati/payment/success/{actionId}")
    public ResponseEntity<Map<String, Object>> lahajatiPaymentSuccess(
            @PathVariable Long actionId,
            @RequestParam("paymentId") String paymentId,
            @RequestParam("PayerID") String payerId) {
        try {
            // --- THIS IS THE FIX ---
            // Call executePayment2 to use the correct API context from properties,
            // just like the createPayment method does.
            Payment payment = paypalService.executePayment2(paymentId, payerId);

            if ("approved".equals(payment.getState())) {
                // Get voice ID from temporary storage
                String voiceId = tempVoiceStorage.get(actionId);
                if (voiceId == null) {
                    // To be safe, let's use a default for testing if it's missing
                    log.warn("VoiceId not found for actionId {}. Using default.", actionId);
                    voiceId = "21m00Tcm4TlvDq8ikWAM"; // Default fallback voice ID
                }

                // Generate audio and update action
                Action updatedAction = actionService.generateLahajatiAudioAndUpdateAction(actionId, voiceId);

                // Clean up temporary storage
                tempVoiceStorage.remove(actionId);

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Payment successful and Lahajati audio generated");
                response.put("actionId", updatedAction.getId());
                response.put("status", updatedAction.getStatutAction());
                response.put("voiceIdUsed", voiceId);

                // Send payment success notification
                notificationService.notifyPaymentSuccess(updatedAction.getUtilisateur(), updatedAction.getUuid(), 10);

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Payment not approved. State: " + payment.getState()));
            }

        } catch (Exception e) {
            // Clean up temporary storage on error
            tempVoiceStorage.remove(actionId);
            log.error("Error executing Lahajati payment for actionId {}", actionId, e);
            return ResponseEntity.badRequest().body(Map.of("error", "Payment execution failed: " + e.getMessage()));
        }
    }


    @GetMapping("/lahajati/payment/cancel/{actionId}")
    public ResponseEntity<Map<String, Object>> lahajatiPaymentCancel(@PathVariable Long actionId) {
        try {
            tempVoiceStorage.remove(actionId);
            // The cancel logic is generic
            actionService.cancelAction(actionId);
            return ResponseEntity.ok(Map.of("message", "Lahajati payment cancelled", "actionId", actionId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to cancel Lahajati action: " + e.getMessage()));
        }
    }

    // --- LAHAJATI BANK TRANSFER WORKFLOW (Mirrors ElevenLabs logic) ---
    @PostMapping("/lahajati/create-action-bank-transfer")
    public ResponseEntity<BankTransferResponse> createLahajatiActionWithBankTransfer(@RequestBody ActionDarija actionRequest) {
        try {
            // Logic is identical to the other service, as these steps are generic
            Action action = actionService.createInitial(actionRequest);
            tempVoiceStorage.put(action.getId(), actionRequest.getVoiceUuid());
            BankTransferResponse response = actionService.createBankTransferResponse(action, actionRequest.getText());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            BankTransferResponse errorResponse = new BankTransferResponse();
            errorResponse.setMessage("Failed to create Lahajati action for bank transfer: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/admin/lahajati/validate-bank-transfer/{actionId}")
    public ResponseEntity<Map<String, Object>> validateLahajatiBankTransferAction(@PathVariable Long actionId) {
        try {
            String voiceId = tempVoiceStorage.get(actionId);
            if (voiceId == null) {
                throw new RuntimeException("Lahajati voice ID not found in temp storage for action " + actionId);
            }

            // Generate audio using the NEW Lahajati service method
            Action validatedAction = actionService.generateLahajatiAudioAndUpdateAction(actionId, voiceId);
            tempVoiceStorage.remove(actionId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bank transfer validated and Lahajati audio generated");
            response.put("actionId", validatedAction.getId());
            response.put("status", validatedAction.getStatutAction());
            response.put("libelle", validatedAction.getLibelle());
            response.put("voiceIdUsed", voiceId);

            // Send bank transfer validation notification
            notificationService.notifyBankTransferValidated(validatedAction.getUtilisateur(), validatedAction.getUuid());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            tempVoiceStorage.remove(actionId);
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Failed to validate Lahajati bank transfer: " + e.getMessage()));
        }
    }

    @PostMapping("/admin/lahajati/reject-bank-transfer/{actionId}")
    public ResponseEntity<Map<String, Object>> rejectLahajatiBankTransferAction(@PathVariable Long actionId) {
        try {
            tempVoiceStorage.remove(actionId);
            // The rejection logic is generic
            actionService.rejectBankTransferAction(actionId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Lahajati bank transfer action rejected", "actionId", actionId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Failed to reject Lahajati bank transfer: " + e.getMessage()));
        }
    }

    // DEBUG ENDPOINTS
    @GetMapping("/debug/voice-storage")
    public ResponseEntity<Map<String, Object>> debugVoiceStorage() {
        Map<String, Object> response = new HashMap<>();
        response.put("tempVoiceStorage", tempVoiceStorage);
        response.put("storageSize", tempVoiceStorage.size());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/debug/clear-voice-storage")
    public ResponseEntity<Map<String, Object>> clearVoiceStorage() {
        int clearedCount = tempVoiceStorage.size();
        tempVoiceStorage.clear();

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Voice storage cleared");
        response.put("clearedCount", clearedCount);
        return ResponseEntity.ok(response);
    }




    @PostMapping("/set-balance")
    public ResponseEntity<?> setClientBalance(@RequestParam String uuid, @RequestParam Double balance) {
        try {
            actionService.setBalanceClient(uuid, balance);
            return ResponseEntity.ok("Balance updated successfully.");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping(value = "/generate-elevenlabs-audio-with-balance")
    public ResponseEntity<String> generateElevenLabsAudio(
            @RequestParam String text,
            @RequestParam String statutAction,
            @RequestParam String voiceUuid,
            @RequestParam String utilisateurUuid,
            @RequestParam String language,
            @RequestParam String projectUuid,
            @RequestParam MultipartFile audioFile
    ) {
        try {
            actionService.generateElevenLabsAudioWithBalance(
                    text, statutAction, voiceUuid, utilisateurUuid, language, projectUuid, audioFile
            );
            return ResponseEntity.ok("Audio generated and action saved successfully (ElevenLabs).");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating ElevenLabs audio: " + e.getMessage());
        }
    }

    @PostMapping("/lahajati-generate-audio-with-balance")
    public ResponseEntity<String> generateLahajatiAudio(
            @RequestParam String text,
            @RequestParam String statutAction,
            @RequestParam String voiceUuid,
            @RequestParam String utilisateurUuid,
            @RequestParam String language,
            @RequestParam String projectUuid
    ) {
        try {
            actionService.generateLahajatiAudioWithBalance(
                    text, statutAction, voiceUuid, utilisateurUuid, language, projectUuid
            );
            return ResponseEntity.ok("Audio generated and action saved successfully (Lahajati).");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating Lahajati audio: " + e.getMessage());
        }
    }


    // ############# NEW WORKFLOW FOR FREE-BUT-LOCKED AUDIO ##########
    // ###############################################################

    @PostMapping("/create-locked-action")
    public ResponseEntity<ActionResponse> createLockedAction(@RequestBody ActionRequest actionRequest) {
        try {
            Action lockedAction = actionService.createLockedAction(actionRequest);

            // Create a response DTO, but DO NOT include the audio bytes
            ActionResponse response = new ActionResponse();
            response.setUuid(lockedAction.getUuid());
            response.setStatutAction(lockedAction.getStatutAction());
            // Return the database ID, which is crucial for the payment flow
            // Let's add the ID to the response DTO for this purpose.
            // You might need to add `private Long id;` to your ActionResponse DTO.
            // For now, let's use a Map for simplicity.
            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("id", lockedAction.getId());
            responseMap.put("uuid", lockedAction.getUuid());
            responseMap.put("status", lockedAction.getStatutAction());
            responseMap.put("message", "Locked action created successfully. Awaiting payment to unlock.");

            return new ResponseEntity(responseMap, HttpStatus.CREATED);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/{actionId}/initiate-unlock-payment")
    public ResponseEntity<Map<String, Object>> initiateUnlockPayment(@PathVariable Long actionId) {
        try {
            Action action = actionRepository.findById(actionId)
                    .orElseThrow(() -> new RuntimeException("Action not found"));

            if (action.getStatutAction() != StatutAction.LOCKED) {
                return ResponseEntity.badRequest().body(Map.of("error", "This action is not locked or does not require payment."));
            }

            double price = actionService.calculatePrice(action.getText());
            if (price < 0.01) price = 0.01;

            Payment payment = paypalService.createPayment(
                    price,
                    "USD",
                    "Unlock Audio Generation",
                    // NOTE: Using a distinct cancel URL path
                    "http://localhost:8080/api/actions/payment/unlock/cancel/" + action.getId(),
                    // NOTE: Using a distinct success URL path
                    "http://localhost:8080/api/actions/payment/unlock/success/" + action.getId()
            );

            String approvalUrl = payment.getLinks().stream()
                    .filter(link -> "approval_url".equals(link.getRel()))
                    .findFirst()
                    .map(link -> link.getHref())
                    .orElseThrow(() -> new PayPalRESTException("Approval URL not found"));

            Map<String, Object> response = new HashMap<>();
            response.put("actionId", action.getId());
            response.put("approvalUrl", approvalUrl);
            response.put("price", price);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error initiating unlock payment for actionId {}", actionId, e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to initiate unlock payment: " + e.getMessage()));
        }
    }

    @GetMapping("/payment/unlock/success/{actionId}")
    public ResponseEntity<Void> unlockPaymentSuccess(
            @PathVariable Long actionId,
            @RequestParam("paymentId") String paymentId,
            @RequestParam("PayerID") String payerId) {

        String errorRedirectPath = "/error"; // A default path in case we can't find the user

        try {
            Payment payment = paypalService.executePayment2(paymentId, payerId);

            if ("approved".equals(payment.getState())) {
                // Unlock the action and get the updated entity, which contains the user
                Action unlockedAction = actionService.unlockActionAfterPayment(actionId);
                Utilisateur user = unlockedAction.getUtilisateur();

                if (user == null || user.getUuid() == null) {
                    log.error("CRITICAL: User not found for unlocked actionId {}. Redirecting to default error page.", actionId);
                    // Redirect to a generic error page if user is missing
                    HttpHeaders headers = new HttpHeaders();
                    headers.setLocation(URI.create(frontendBaseUrl + errorRedirectPath));
                    return new ResponseEntity<>(headers, HttpStatus.FOUND);
                }

                // --- THIS IS THE FIX ---
                // Dynamically build the correct, user-specific redirect URL
                String userUuid = user.getUuid();
                String successRedirectUrl = String.format(
                        "%s/speakerDasboard/%s/demande-generation?unlock_success=true&action_id=%d",
                        frontendBaseUrl,
                        userUuid,
                        actionId
                );

                HttpHeaders headers = new HttpHeaders();
                headers.setLocation(URI.create(successRedirectUrl));
                return new ResponseEntity<>(headers, HttpStatus.FOUND);

            } else {
                // If payment fails, redirect back with an error message
                String failureRedirectUrl = frontendBaseUrl + errorRedirectPath + "?error=payment_not_approved";
                HttpHeaders headers = new HttpHeaders();
                headers.setLocation(URI.create(failureRedirectUrl));
                return new ResponseEntity<>(headers, HttpStatus.FOUND);
            }
        } catch (Exception e) {
            log.error("Error executing unlock payment for actionId {}", actionId, e);
            // On critical error, redirect back with an error message
            String failureRedirectUrl = frontendBaseUrl + errorRedirectPath + "?error=payment_execution_failed";
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create(failureRedirectUrl));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }
    }

    // You can add a cancel endpoint if desired, for now it can be a no-op
    @GetMapping("/payment/unlock/cancel/{actionId}")
    public ResponseEntity<Map<String, Object>> unlockPaymentCancel(@PathVariable Long actionId) {
        return ResponseEntity.ok(Map.of("message", "Unlock payment cancelled for action " + actionId));
    }


    @PostMapping("/{actionId}/setup-bank-transfer-unlock")
    public ResponseEntity<BankTransferResponse> setupBankTransferForUnlock(@PathVariable Long actionId) {
        try {
            Action action = actionRepository.findById(actionId)
                    .orElseThrow(() -> new RuntimeException("Action not found with ID: " + actionId));

            if (action.getStatutAction() != StatutAction.LOCKED) {
                // You could return an error, but creating a response for a completed action is also fine.
                BankTransferResponse errorResponse = new BankTransferResponse();
                errorResponse.setMessage("This action is not locked or has already been processed.");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Use the existing service method to generate the bank transfer details and libelle
            BankTransferResponse response = actionService.createBankTransferResponse(action, action.getText());

            // The action's status remains LOCKED until an admin validates the transfer
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error setting up bank transfer for unlock on actionId {}: {}", actionId, e.getMessage());
            BankTransferResponse errorResponse = new BankTransferResponse();
            errorResponse.setMessage("Failed to setup bank transfer: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * MODIFIED
     * Gets the current status of an action.
     * This is used by the frontend to poll for payment completion.
     * @param actionId The ID of the action to check.
     * @return The Action entity with its current status.
     */
    @GetMapping("/status/{actionId}")
    public ResponseEntity<Action> getActionStatus(@PathVariable Long actionId) {
        Action action = actionRepository.findById(actionId)
                .orElse(null);

        if (action == null) {
            return ResponseEntity.notFound().build();
        }

        // --- SECURITY MODIFICATION ---
        // If the action is locked, do not send the audio data.
        if (action.getStatutAction() == StatutAction.LOCKED) {
            action.setAudioGenerated(null);
        }

        return ResponseEntity.ok(action);
    }

}
