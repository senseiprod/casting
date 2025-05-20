package com.example.senseiVoix.controllers;

import com.example.senseiVoix.dtos.voix2.Voix2Request;
import com.example.senseiVoix.dtos.voix2.Voix2Response;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.entities.Voix2;
import com.example.senseiVoix.services.Voix2Service;
import com.example.senseiVoix.services.serviceImp.UtilisateurServiceImpl;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/voix2")
@CrossOrigin("*")
public class Voix2Controller {

    private final UtilisateurServiceImpl utilisateurServiceImpl;
    private final Voix2Service voix2Service;

    public Voix2Controller(UtilisateurServiceImpl utilisateurServiceImpl, Voix2Service voix2Service) {
        this.utilisateurServiceImpl = utilisateurServiceImpl;
        this.voix2Service = voix2Service;
    }

    @PostMapping("/create")
    public ResponseEntity<Voix2Response> createVoiceAndClone(@RequestPart("files") MultipartFile files,
                                                            @RequestParam("name") String name,
                                                            @RequestParam("id") String id,
                                                            @RequestParam("gender") String gender,
                                                            @RequestParam("language") String language,

                                                            @RequestParam("price") Double price,
                                                            @RequestParam("removeBackgroundNoise") boolean removeBackgroundNoise,
                                                            @RequestParam("description") String description,
                                                            @RequestParam(value="labels",required = false) String labels) throws IOException {

        // Fetching user by ID
        Utilisateur utilisateur = utilisateurServiceImpl.findById(id);
        if (utilisateur == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null); // User not found
        }

        Voix2 voix = voix2Service.createVoice(files, name, utilisateur, gender, language, price, removeBackgroundNoise, description, labels);

        // Mapping the entity to response DTO
        Voix2Response voixResponse = convertEntityToResponse(voix);

        // Returning the response DTO wrapped in ResponseEntity
        return ResponseEntity.status(HttpStatus.CREATED).body(voixResponse);
    }

    // Parsing the response from the external service to get the voice URL
    private String parseVoiceUrlFromResponse(String cloneResponse) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(cloneResponse);
        return rootNode.path("id").asText(); // Extracting the voice URL
    }

    // Convert Voix entity to VoixResponse DTO
    private Voix2Response convertEntityToResponse(Voix2 voix) {
        return new Voix2Response(
                voix.getUuid(),
                voix.getCode(),
                voix.getSpeaker().getUuid(),
                voix.getNombrePoint(),
                voix.getGender(),
                voix.getLanguage(),
                voix.getType(),
                voix.getTypeVoice(),
                voix.getName(),
                voix.getPrice(),
                voix.getElevenlabs_id()
        );

    }

    @GetMapping("/{id}")
    public ResponseEntity<Voix2Response> getVoiceById(@PathVariable String id) {
        Voix2 voix = voix2Service.findByUuid(id);
        if (voix == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(convertEntityToResponse(voix));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Voix2Response>> getAllVoices() {
        List<Voix2> voices = voix2Service.findAll();
        List<Voix2Response> responseList = voices.stream().map(this::convertEntityToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/speaker-voice/{uuid}")
    public ResponseEntity<List<Voix2Response>> getAllVoicesBySpeaker(@PathVariable String uuid) {
        List<Voix2> voices = voix2Service.findAllBySpeaker(uuid);
        List<Voix2Response> responseList = voices.stream().map(this::convertEntityToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Voix2Response> updateVoice(@PathVariable Long id, @RequestBody Voix2Request voixRequest) {
        Voix2 updatedVoix = voix2Service.updateVoice(id, voixRequest);
        if (updatedVoix == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(convertEntityToResponse(updatedVoix));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteVoice(@PathVariable Long id) {
        boolean deleted = voix2Service.deleteVoice(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.noContent().build();
    }




}
