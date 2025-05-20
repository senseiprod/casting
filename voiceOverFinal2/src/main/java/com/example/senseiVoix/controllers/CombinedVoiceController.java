package com.example.senseiVoix.controllers;

import com.example.senseiVoix.services.VoiceCombinerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/combined-voices")
public class CombinedVoiceController {

    private final VoiceCombinerService voiceCombinerService;

    @Autowired
    public CombinedVoiceController(VoiceCombinerService voiceCombinerService) {
        this.voiceCombinerService = voiceCombinerService;
    }

    @GetMapping("/combined")
    public ResponseEntity<Map<String, Object>> getCombinedVoices(
            @RequestParam(value = "next_page_token", required = false) String nextPageToken,
            @RequestParam(value = "page_size", required = false, defaultValue = "100") Integer pageSize,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "sort_direction", required = false) String sortDirection,
            @RequestParam(value = "voice_type", required = false) String voiceType,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "fine_tuning_state", required = false) String fineTuningState,
            @RequestParam(value = "include_total_count", required = false, defaultValue = "true") Boolean includeTotalCount,
            // Additional parameters for shared voices
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "age", required = false) String age,
            @RequestParam(value = "accent", required = false) String accent,
            @RequestParam(value = "language", required = false) String language) {

        Map<String, Object> response = voiceCombinerService.getCombinedVoices(
                nextPageToken, pageSize, search, sort, sortDirection,
                voiceType, category, fineTuningState, includeTotalCount,
                gender, age, accent, language);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
