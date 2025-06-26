package com.example.senseiVoix.controllers;
import com.example.senseiVoix.dtos.demande.DemandeRequest;
import com.example.senseiVoix.dtos.demande.DemandeResponse;
import com.example.senseiVoix.entities.Demande;
import com.example.senseiVoix.services.DemandeService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/demandes")
public class DemandeController {

    private final DemandeService demandeService;

    public DemandeController(DemandeService demandeService) {
        this.demandeService = demandeService;
    }

    @GetMapping
    public ResponseEntity<List<DemandeResponse>> getAllDemandes() {
        return ResponseEntity.ok(demandeService.getAllDemandes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Demande>> getDemandeById(@PathVariable Long id) {
        return ResponseEntity.ok(demandeService.getDemandeById(id));
    }

    @GetMapping("/uuid/{uuid}")
    public ResponseEntity<DemandeResponse> getDemandeByUuid(@PathVariable String uuid) {
        return ResponseEntity.ok(demandeService.getDemandeByUuid(uuid));
    }

    @GetMapping("/demandeur/{uuid}")
    public ResponseEntity<List<DemandeResponse>> getDemandesByDemandeurUuid(@PathVariable String uuid) {
        return ResponseEntity.ok(demandeService.getDemandesByDemandeurUuid(uuid));
    }

    @GetMapping("/en-attente")
    public ResponseEntity<List<DemandeResponse>> getDemandesEnAttente() {
        return ResponseEntity.ok(demandeService.getDemandesEnAttente());
    }

    @GetMapping("/acceptees")
    public ResponseEntity<List<DemandeResponse>> getDemandesAcceptees() {
        return ResponseEntity.ok(demandeService.getDemandesAcceptees());
    }

    @GetMapping("/refusees")
    public ResponseEntity<List<DemandeResponse>> getDemandesRefusees() {
        return ResponseEntity.ok(demandeService.getDemandesRefusees());
    }

    @GetMapping("/count/en-attente")
    public ResponseEntity<Long> countDemandesEnAttente() {
        return ResponseEntity.ok(demandeService.countDemandesEnAttente());
    }

    @GetMapping("/count/acceptees")
    public ResponseEntity<Long> countDemandesAcceptees() {
        return ResponseEntity.ok(demandeService.countDemandesAcceptees());
    }

    @GetMapping("/count/refusees")
    public ResponseEntity<Long> countDemandesRefusees() {
        return ResponseEntity.ok(demandeService.countDemandesRefusees());
    }

    @GetMapping("/non-supprimees")
    public ResponseEntity<List<DemandeResponse>> getDemandesNonSupprimees() {
        return ResponseEntity.ok(demandeService.getDemandesNonSupprimees());
    }

    @GetMapping("/supprimees")
    public ResponseEntity<List<DemandeResponse>> getDemandesSupprimees() {
        return ResponseEntity.ok(demandeService.getDemandesSupprimees());
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<DemandeResponse> createDemande(@RequestBody DemandeRequest demandeRequest) {
        return ResponseEntity.ok(demandeService.createDemande(demandeRequest));
    }

    @PutMapping("/update/{uuid}")
    public ResponseEntity<DemandeResponse> updateDemande(@PathVariable String uuid, @RequestParam String status) {
        return ResponseEntity.ok(demandeService.updateDemande(uuid, status));
    }

    @DeleteMapping("/delete/{uuid}")
    public ResponseEntity<Void> deleteDemande(@PathVariable String uuid) {
        demandeService.deleteDemande(uuid);
        return ResponseEntity.noContent().build();
    }

}
