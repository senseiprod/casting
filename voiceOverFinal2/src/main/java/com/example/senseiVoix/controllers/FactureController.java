package com.example.senseiVoix.controllers;

import com.example.senseiVoix.dtos.facture.FactureClient;
import com.example.senseiVoix.dtos.facture.FactureClientResponse;
import com.example.senseiVoix.dtos.facture.FactureSpeaker;
import com.example.senseiVoix.dtos.facture.FactureSpeakerResponse;
import com.example.senseiVoix.entities.Facture;
import com.example.senseiVoix.enumeration.StatutFacture;
import com.example.senseiVoix.repositories.FactureRepository;
import com.example.senseiVoix.services.serviceImp.FactureServiceImpl;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializer;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/factures")
public class FactureController {

    @Autowired
    private FactureServiceImpl factureService;
    @Autowired
    private FactureRepository factureRepository;

    @PostMapping("/client")
    public ResponseEntity<FactureClientResponse> ajouterFactureClient(@RequestBody FactureClient factureClient) {
        return ResponseEntity.ok(factureService.ajouterFactureClient(factureClient));
    }

    private final Gson gson = new GsonBuilder()
            .registerTypeAdapter(LocalDateTime.class, (JsonDeserializer<LocalDateTime>)
                    (json, type, jsonDeserializationContext) ->
                            LocalDateTime.parse(json.getAsJsonPrimitive().getAsString(), DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            ).create();

    @PostMapping(value = "/speaker", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<FactureSpeakerResponse> ajouterFactureSpeaker(
            @Valid @ModelAttribute FactureSpeaker factureSpeaker) throws IOException {
        return ResponseEntity.ok(factureService.ajouterFactureSpeaker(factureSpeaker));
    }


    @GetMapping("/{id}")
    public ResponseEntity<FactureSpeakerResponse> getSpeakerFactureById(@PathVariable long id) {
        return ResponseEntity.ok(factureRepository.getFactureById(id));
    }

    @GetMapping
    public ResponseEntity<List<Facture>> getAllFactures() {
        return ResponseEntity.ok(factureRepository.findAll());
    }


    @GetMapping("/client/{clientUuid}")
    public ResponseEntity<List<FactureClientResponse>> getFacturesClient(@PathVariable String clientUuid) {
        return ResponseEntity.ok(factureService.getFacturesClient(clientUuid));
    }

    @GetMapping("/speaker/{speakerUuid}")
    public ResponseEntity<List<FactureSpeakerResponse>> getFacturesSpeaker(@PathVariable String speakerUuid) {
        return ResponseEntity.ok(factureService.getFacturesSpeaker(speakerUuid));
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Facture>> getFacturesParStatut(@PathVariable StatutFacture statut) {
        return ResponseEntity.ok(factureService.getFacturesParStatut(statut));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Facture>> getFacturesApresDate(@PathVariable LocalDateTime date) {
        return ResponseEntity.ok(factureService.getFacturesApresDate(date));
    }
    @PostMapping("/{id}/uploadPdf")
    public ResponseEntity<String> uploadFacturePdf(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        Facture facture = factureRepository.findByUuid(id);
        try {
            facture.setPdfData(file.getBytes());
            factureRepository.save(facture);
            return ResponseEntity.ok("Fichier PDF enregistré avec succès.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de l'enregistrement du fichier");
        }
    }
    @GetMapping("/{id}/downloadPdf")
    public ResponseEntity<byte[]> downloadFacturePdf(@PathVariable String id) {
        Facture facture = factureRepository.findByUuid(id);
        if (facture.getPdfData() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=facture_" + id + ".pdf")
                .body(facture.getPdfData());
    }
}
