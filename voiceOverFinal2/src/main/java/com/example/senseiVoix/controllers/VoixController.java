package com.example.senseiVoix.controllers;

import com.example.senseiVoix.dtos.voix.VoixRequest;
import com.example.senseiVoix.dtos.voix.VoixResponse;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.entities.Voix;
import com.example.senseiVoix.services.UtilisateurService;
import com.example.senseiVoix.services.VoixService;
import com.example.senseiVoix.services.serviceImp.PlayHtServiceImpl;
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
@RequestMapping("/api/voix")
public class VoixController {

    private final VoixService voixService;
    private final UtilisateurService utilisateurService;
    private final PlayHtServiceImpl playHtService;
    private final UtilisateurServiceImpl utilisateurServiceImpl;

    public VoixController(VoixService voixService, UtilisateurService utilisateurService, PlayHtServiceImpl playHtService, UtilisateurServiceImpl utilisateurServiceImpl) {
        this.voixService = voixService;
        this.utilisateurService = utilisateurService;
        this.playHtService = playHtService;
        this.utilisateurServiceImpl = utilisateurServiceImpl;
    }

    @PostMapping("/create")
    public ResponseEntity<VoixResponse> createVoiceAndClone(@RequestParam("file") MultipartFile file,
                                                            @RequestParam("voiceName") String voiceName,
                                                            @RequestParam("id") String id,
                                                            @RequestParam("gender") String gender,
                                                            @RequestParam("language") String language,

                                                            @RequestParam("price") Double price) throws IOException {

        // Fetching user by ID
        Utilisateur utilisateur = utilisateurServiceImpl.findById(id);
        if (utilisateur == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null); // User not found
        }

        Voix voix = voixService.createVoice(file, voiceName, utilisateur, gender, language, price);

        // Mapping the entity to response DTO
        VoixResponse voixResponse = convertEntityToResponse(voix);

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
    private VoixResponse convertEntityToResponse(Voix voix) {
        return new VoixResponse(
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
                voix.getUrl()
        );
        
    }

    @GetMapping("/{id}")
    public ResponseEntity<VoixResponse> getVoiceById(@PathVariable String id) {
        Voix voix = voixService.findByUuid(id);
        if (voix == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(convertEntityToResponse(voix));
    }

    @GetMapping("/all")
    public ResponseEntity<List<VoixResponse>> getAllVoices() {
        List<Voix> voices = voixService.findAll();
        List<VoixResponse> responseList = voices.stream().map(this::convertEntityToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/speaker-voice/{uuid}")
    public ResponseEntity<List<VoixResponse>> getAllVoicesBySpeaker(@PathVariable String uuid) {
        List<Voix> voices = voixService.findAllBySpeaker(uuid);
        List<VoixResponse> responseList = voices.stream().map(this::convertEntityToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<VoixResponse> updateVoice(@PathVariable Long id, @RequestBody VoixRequest voixRequest) {
        Voix updatedVoix = voixService.updateVoice(id, voixRequest);
        if (updatedVoix == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(convertEntityToResponse(updatedVoix));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteVoice(@PathVariable Long id) {
        boolean deleted = voixService.deleteVoice(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.noContent().build();
    }

}
