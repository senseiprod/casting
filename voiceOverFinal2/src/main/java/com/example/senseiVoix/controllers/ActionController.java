package com.example.senseiVoix.controllers;

import com.example.senseiVoix.dtos.action.ActionResponse;
import com.example.senseiVoix.entities.Action;
import com.example.senseiVoix.services.serviceImp.ActionServiceImpl;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.paypal.base.rest.PayPalRESTException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actions")
public class ActionController {

    @Autowired
    private ActionServiceImpl actionService;

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
}
