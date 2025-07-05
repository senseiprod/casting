package com.example.senseiVoix.controllers;



import com.example.senseiVoix.dtos.SpeakerInfo.SpeakerInfo;
import com.example.senseiVoix.services.SpeakerInfoService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/speakersInfo")
public class SpeakerInfoController {

    private final SpeakerInfoService speakerInfoService;

    public SpeakerInfoController(SpeakerInfoService speakerInfoService) {
        this.speakerInfoService = speakerInfoService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerSpeaker(@Valid @RequestBody SpeakerInfo speakerDTO) {

        // Example: check if email already exists
        // You can handle this in the service with custom exception if you want
        // For simplicity here:
        // if (speakerService.emailExists(speakerDTO.getEmail())) {
        //     return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already in use");
        // }

        com.example.senseiVoix.entities.SpeakerInfo savedSpeaker = speakerInfoService.saveSpeaker(speakerDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedSpeaker);
    }
}
