package com.example.senseiVoix.services;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;

public interface LahajatiService {

    ResponseEntity<byte[]> generateSpeech(Map<String, Object> requestBody);
    ResponseEntity<String> getVoices(Optional<Integer> page, Optional<Integer> perPage, Optional<String> gender);
    ResponseEntity<String> getPerformanceStyles(Optional<Integer> page, Optional<Integer> perPage);
    ResponseEntity<String> getDialects(Optional<Integer> page, Optional<Integer> perPage);
    ResponseEntity<byte[]> textToSpeechPro(Map<String, Object> requestBody);
    ResponseEntity<byte[]> speechToSpeechPro(MultipartFile audioFile, String idVoice, boolean professionalQuality);
    ResponseEntity<String> getGeneralVoices(Optional<Integer> page, Optional<Integer> perPage, Optional<String> gender);
    ResponseEntity<String> createClonedVoice(String voiceName, String gender, MultipartFile voiceImage, MultipartFile audioFile, String voiceTags);
    ResponseEntity<String> updateClonedVoice(String voiceId, Map<String, Object> requestBody);
    ResponseEntity<String> deleteClonedVoice(String voiceId);

}
