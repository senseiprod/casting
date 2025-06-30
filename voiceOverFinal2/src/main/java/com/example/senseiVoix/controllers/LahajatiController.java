package com.example.senseiVoix.controllers;

import com.example.senseiVoix.services.LahajatiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/lahajati")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LahajatiController {

    private final LahajatiService lahajatiService;

    @Value("${lahajati.api.key}")
    private String apiKey; 

    @PostMapping("/absolute-control")
    public ResponseEntity<byte[]> generateSpeech(@RequestBody Map<String, Object> requestBody) {
        log.info("Generate speech request received");
        return lahajatiService.generateSpeech(requestBody); 
    }

    @GetMapping("/voices-absolute-control")
    public ResponseEntity<String> getVoices(
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<Integer> per_page,
            @RequestParam Optional<String> gender
    ) {
        log.info("Get voices request received with params - page: {}, per_page: {}, gender: {}", page, per_page, gender);
        return lahajatiService.getVoices(page, per_page, gender);
    }

    @GetMapping("/performance-absolute-control")
    public ResponseEntity<String> getPerformanceStyles(
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<Integer> per_page
    ) {
        log.info("Get performance styles request received");
        return lahajatiService.getPerformanceStyles(page, per_page);
    }

    @GetMapping("/dialect-absolute-control")
    public ResponseEntity<String> getDialects(
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<Integer> per_page
    ) {
        log.info("Get dialects request received");
        return lahajatiService.getDialects(page, per_page);
    }

    @PostMapping("/text-to-speech-pro")
    public ResponseEntity<byte[]> textToSpeechPro(@RequestBody Map<String, Object> requestBody) {
        log.info("Text to speech pro request received");
        return lahajatiService.textToSpeechPro(requestBody);
    }

    @PostMapping("/speech-to-speech-pro")
    public ResponseEntity<byte[]> speechToSpeechPro(
            @RequestParam("audio_file") MultipartFile audioFile,
            @RequestParam("id_voice") String idVoice,
            @RequestParam(value = "professional_quality", required = false, defaultValue = "0") boolean professionalQuality
    ) {
        log.info("Speech to speech pro request received");
        return lahajatiService.speechToSpeechPro(audioFile, idVoice, professionalQuality);
    }

    @GetMapping("/voices")
    public ResponseEntity<String> getGeneralVoices(
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<Integer> per_page,
            @RequestParam Optional<String> gender
    ) {
        log.info("Get general voices request received");
        return lahajatiService.getGeneralVoices(page, per_page, gender);
    }

    @PostMapping("/voices/cloned")
    public ResponseEntity<String> createClonedVoice(
            @RequestParam("voice_name") String voiceName,
            @RequestParam("gender") String gender,
            @RequestParam("voice_image") MultipartFile voiceImage,
            @RequestParam("audio_file") MultipartFile audioFile,
            @RequestParam("voice_tags") String voiceTags
    ) {
        log.info("Create cloned voice request received");
        return lahajatiService.createClonedVoice(voiceName, gender, voiceImage, audioFile, voiceTags);
    }

    @PutMapping("/voices/cloned/{voiceId}")
    public ResponseEntity<String> updateClonedVoice(
            @PathVariable String voiceId,
            @RequestBody Map<String, Object> requestBody
    ) {
        log.info("Update cloned voice request received for ID: {}", voiceId);
        return lahajatiService.updateClonedVoice(voiceId, requestBody);
    }

    @DeleteMapping("/voices/cloned/{voiceId}")
    public ResponseEntity<String> deleteClonedVoice(@PathVariable String voiceId) {
        log.info("Delete cloned voice request received for ID: {}", voiceId);
        return lahajatiService.deleteClonedVoice(voiceId);
    }

    @GetMapping("/debug-voices")
    public ResponseEntity<String> debugVoices() {
        try {
            log.info("Debug voices endpoint called");
            log.info("API Key present: {}", apiKey != null && !apiKey.isEmpty());
            return lahajatiService.getVoices(Optional.of(1), Optional.of(10), Optional.empty());
        } catch (Exception e) {
            log.error("Debug voices error: ", e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
