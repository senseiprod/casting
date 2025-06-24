package com.example.senseiVoix.controllers;


import com.example.senseiVoix.services.LahajatiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/lahajati")
@RequiredArgsConstructor
public class LahajatiController {

    private final LahajatiService LahajatiService;

    @PostMapping("/absolute-control")
    public ResponseEntity<byte[]> generateSpeech(@RequestBody Map<String, Object> requestBody) {
        return LahajatiService.generateSpeech(requestBody);
    }

    @GetMapping("/voices-absolute-control")
    public ResponseEntity<String> getVoices(
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<Integer> per_page,
            @RequestParam Optional<String> gender
    ) {
        return LahajatiService.getVoices(page, per_page, gender);
    }

    @GetMapping("/performance-absolute-control")
    public ResponseEntity<String> getPerformanceStyles(
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<Integer> per_page
    ) {
        return LahajatiService.getPerformanceStyles(page, per_page);
    }

    @GetMapping("/dialect-absolute-control")
    public ResponseEntity<String> getDialects(
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<Integer> per_page
    ) {
        return LahajatiService.getDialects(page, per_page);
    }


    @PostMapping("/text-to-speech-pro")
    public ResponseEntity<byte[]> textToSpeechPro(@RequestBody Map<String, Object> requestBody) {
        return LahajatiService.textToSpeechPro(requestBody);
    }


    @PostMapping("/speech-to-speech-pro")
    public ResponseEntity<byte[]> speechToSpeechPro(
            @RequestParam("audio_file") MultipartFile audioFile,
            @RequestParam("id_voice") String idVoice,
            @RequestParam(value = "professional_quality", required = false, defaultValue = "0") boolean professionalQuality
    ) {
        return LahajatiService.speechToSpeechPro(audioFile, idVoice, professionalQuality);
    }

    @GetMapping("/voices")
    public ResponseEntity<String> getGeneralVoices(
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<Integer> per_page,
            @RequestParam Optional<String> gender
    ) {
        return LahajatiService.getGeneralVoices(page, per_page, gender);
    }

    @PostMapping("/voices/cloned")
    public ResponseEntity<String> createClonedVoice(
            @RequestParam("voice_name") String voiceName,
            @RequestParam("gender") String gender,
            @RequestParam("voice_image") MultipartFile voiceImage,
            @RequestParam("audio_file") MultipartFile audioFile,
            @RequestParam("voice_tags") String voiceTags
    ) {
        return LahajatiService.createClonedVoice(voiceName, gender, voiceImage, audioFile, voiceTags);
    }

    @PutMapping("/voices/cloned/{voiceId}")
    public ResponseEntity<String> updateClonedVoice(
            @PathVariable String voiceId,
            @RequestBody Map<String, Object> requestBody
    ) {
        return LahajatiService.updateClonedVoice(voiceId, requestBody);
    }

    @DeleteMapping("/voices/cloned/{voiceId}")
    public ResponseEntity<String> deleteClonedVoice(@PathVariable String voiceId) {
        return LahajatiService.deleteClonedVoice(voiceId);
    }





}