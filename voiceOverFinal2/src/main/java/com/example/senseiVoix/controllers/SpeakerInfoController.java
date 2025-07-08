package com.example.senseiVoix.controllers;



import com.example.senseiVoix.dtos.SpeakerInfo.SpeakerInfo;
import com.example.senseiVoix.services.SpeakerInfoService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


@RestController
@RequestMapping("/api/speakersInfo")
public class SpeakerInfoController {

    private final SpeakerInfoService speakerInfoService;

    public SpeakerInfoController(SpeakerInfoService speakerInfoService) {
        this.speakerInfoService = speakerInfoService;
    }

    // The endpoint signature is completely changed
    @PostMapping(value = "/register", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<?> registerSpeaker(
            @RequestPart("speakerData") @Valid SpeakerInfo speakerDTO,
            @RequestPart(value = "audioFile", required = false) MultipartFile audioFile) {

        try {
            // FIX: The variable 'savedSpeaker' must be of the ENTITY type, because that's what the service returns.
            com.example.senseiVoix.entities.SpeakerInfo savedSpeaker = speakerInfoService.saveSpeaker(speakerDTO, audioFile);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedSpeaker);
        } catch (IOException e) {
            // This block will now correctly catch the exception from the service
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing audio file.");
        }
    }
}
