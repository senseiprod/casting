package com.example.senseiVoix.controllers;

import com.example.senseiVoix.services.ElevenLabsService;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Controller
@RequestMapping("/api/elevenlabs")
public class ElevenLabsController {

    private final ElevenLabsService elevenLabsService;

    public ElevenLabsController(ElevenLabsService elevenLabsService) {
        this.elevenLabsService = elevenLabsService;
    }

    @PostMapping("/voices/add")
    public ResponseEntity<Map<String, Object>> createVoiceClone(
            @RequestParam("name") String name,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "remove_background_noise", required = false, defaultValue = "false") boolean removeBackgroundNoise,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "labels", required = false) String labels) {

        Map<String, Object> response = elevenLabsService.createVoiceClone(name, files, removeBackgroundNoise, description, labels);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/text-to-speech/{voiceId}")
    public ResponseEntity<byte[]> textToSpeech(
            @PathVariable("voiceId") String voiceId,
            @RequestParam(value = "output_format", required = false, defaultValue = "mp3_44100_128") String outputFormat,
            @RequestParam(value = "enable_logging", required = false, defaultValue = "true") boolean enableLogging,
            @RequestParam(value = "optimize_streaming_latency", required = false) Integer optimizeStreamingLatency,
            @RequestBody Map<String, Object> requestBody) {

        byte[] audioData = elevenLabsService.textToSpeech(voiceId, outputFormat, enableLogging,
                optimizeStreamingLatency, requestBody);

        return ResponseEntity
                .ok()
                .contentType(getMediaType(outputFormat))
                .body(audioData);
    }

    @DeleteMapping("/voices/{voiceId}")
    public ResponseEntity<Map<String, String>> deleteVoice(@PathVariable("voiceId") String voiceId) {
        Map<String, String> response = elevenLabsService.deleteVoice(voiceId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/voices")
    public ResponseEntity<Map<String, Object>> listVoices(
            @RequestParam(value = "next_page_token", required = false) String nextPageToken,
            @RequestParam(value = "page_size", required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "sort_direction", required = false) String sortDirection,
            @RequestParam(value = "voice_type", required = false) String voiceType,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "fine_tuning_state", required = false) String fineTuningState,
            @RequestParam(value = "include_total_count", required = false, defaultValue = "true") Boolean includeTotalCount) {

        Map<String, Object> response = elevenLabsService.listVoices(
                nextPageToken, pageSize, search, sort, sortDirection,
                voiceType, category, fineTuningState, includeTotalCount);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    @GetMapping("/shared-voices")
    public ResponseEntity<Map<String, Object>> listSharedVoices(

            @RequestParam(value = "page_size", required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "age", required = false) String age,
            @RequestParam(value = "accent", required = false) String accent,
            @RequestParam(value = "nextPageToken", required = false) int nextPageToken,
            @RequestParam(value = "language", required = false) String language
            ) {

        Map<String, Object> response = elevenLabsService.listSharedVoices(
                 pageSize, search, sort, category, gender, age, accent, language,nextPageToken);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    private MediaType getMediaType(String outputFormat) {
        if (outputFormat.startsWith("mp3")) {
            return MediaType.parseMediaType("audio/mpeg");
        } else if (outputFormat.startsWith("pcm")) {
            return MediaType.parseMediaType("audio/wav");
        } else if (outputFormat.startsWith("ulaw")) {
            return MediaType.parseMediaType("audio/basic");
        } else {
            return MediaType.parseMediaType("audio/mpeg"); // Default to mp3
        }
    }

    @GetMapping("/export")
    public ResponseEntity<ByteArrayResource> exportVoiceNamesToExcel() throws Exception {
        // Generate the Excel content
        ByteArrayResource resource = elevenLabsService.generateVoiceNamesExcel();
    
        // Define the folder and file path
        String folderPath = "/Users/mac/Desktop/abdessadeq/casting/my-exports"; 
        String fileName = "VoiceNames.xlsx";
        Path filePath = Paths.get(folderPath, fileName);
    
        // Create the folder if it doesn't exist
        Files.createDirectories(Paths.get(folderPath));
    
        // Save the file to disk
        Files.write(filePath, resource.getByteArray());
    
        // Return the file as download
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .header(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .contentLength(resource.contentLength())
                .body(resource);
    }
    
    @PostMapping("/import")
    public ResponseEntity<String> importVoices() {
        elevenLabsService.fetchAndSaveVoicesFromElevenLabs();
        return ResponseEntity.ok("Voices imported successfully");
    }

    @GetMapping("/voices/{voiceId}")
    public ResponseEntity<?> getVoiceDetails(@PathVariable("voiceId") String voiceId) {
        Map<String, Object> voiceDetails = elevenLabsService.getVoiceDetails(voiceId);

        if (voiceDetails != null && !voiceDetails.isEmpty()) {
            // Voice found, return the details with 200 OK
            return new ResponseEntity<>(voiceDetails, HttpStatus.OK);
        } else {
            // Voice not found, return a 404 Not Found status
            return new ResponseEntity<>("Voice not found with ID: " + voiceId, HttpStatus.NOT_FOUND);
        }
    }
}
