package com.example.senseiVoix.controllers;

import com.example.senseiVoix.dtos.speacker.SpeakerRequest;
import com.example.senseiVoix.dtos.speacker.SpeakerResponse;
import com.example.senseiVoix.entities.Speaker;
import com.example.senseiVoix.services.SpeakerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/speakers")
@CrossOrigin("*")
public class SpeakerController {

    @Autowired
    private SpeakerService speakerService;

    /**
     * Get a list of all speakers.
     *
     * @return a ResponseEntity containing a list of all speakers and HTTP status OK (200)
     */
    @GetMapping
    public ResponseEntity<List<SpeakerResponse>> getAllSpeakers() {
        List<SpeakerResponse> speakers = speakerService.getAllSpeakers();
        return new ResponseEntity<>(speakers, HttpStatus.OK);
    }

    /**
     * Get a speaker by their ID.
     *
     * @param id the ID of the speaker
     * @return a ResponseEntity containing the speaker's details and HTTP status OK (200), or NOT_FOUND (404) if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Speaker> getSpeakerById(@PathVariable Long id) {
        ResponseEntity<Speaker> speaker = speakerService.getSpeakerById(id)
                .map(response -> new ResponseEntity<>(response, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        return speaker;
    }

    /**
     * Get a speaker by their UUID.
     *
     * @param uuid the UUID of the speaker
     * @return a ResponseEntity containing the speaker's details and HTTP status OK (200), or NOT_FOUND (404) if not found
     */
    @GetMapping("/uuid/{uuid}")
    public ResponseEntity<SpeakerResponse> getSpeakerByUuid(@PathVariable String uuid) {
        SpeakerResponse speakerResponse = speakerService.getSpeakerByUuid(uuid);
        return speakerResponse != null ? new ResponseEntity<>(speakerResponse, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    /**
     * Get a speaker by their email.
     *
     * @param email the email of the speaker
     * @return a ResponseEntity containing the speaker's details and HTTP status OK (200), or NOT_FOUND (404) if not found
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<SpeakerResponse> getSpeakerByEmail(@PathVariable String email) {
        SpeakerResponse speakerResponse = speakerService.getSpeakerByEmail(email);
        return speakerResponse != null ? new ResponseEntity<>(speakerResponse, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    /**
     * Get a list of speakers by their earnings.
     *
     * @param earnings the earnings threshold
     * @return a ResponseEntity containing a list of speakers with earnings greater than or equal to the specified value
     */
    @GetMapping("/earnings/{earnings}")
    public ResponseEntity<List<SpeakerResponse>> getSpeakersByEarnings(@PathVariable Double earnings) {
        List<SpeakerResponse> speakers = speakerService.getSpeakersByEarnings(earnings);
        return new ResponseEntity<>(speakers, HttpStatus.OK);
    }

    /**
     * Get a list of speakers that are not deleted.
     *
     * @return a ResponseEntity containing a list of active speakers
     */
    @GetMapping("/active")
    public ResponseEntity<List<SpeakerResponse>> getSpeakersNotDeleted() {
        List<SpeakerResponse> speakers = speakerService.getSpeakersNotDeleted();
        return new ResponseEntity<>(speakers, HttpStatus.OK);
    }

    /**
     * Get a list of speakers that are deleted.
     *
     * @return a ResponseEntity containing a list of deleted speakers
     */
    @GetMapping("/deleted")
    public ResponseEntity<List<SpeakerResponse>> getSpeakersDeleted() {
        List<SpeakerResponse> speakers = speakerService.getSpeakersDeleted();
        return new ResponseEntity<>(speakers, HttpStatus.OK);
    }
    @GetMapping("/search")
    public List<SpeakerResponse> searchSpeakers(@RequestParam String name) {
        return speakerService.searchByName(name);
    }

    /**
     * Create a new speaker.
     *
     * @param speakerRequest the speaker details to create
     * @return a ResponseEntity containing the created speaker's details and HTTP status CREATED (201)
     */
    @PostMapping
    public ResponseEntity<SpeakerResponse> createSpeaker(@RequestBody SpeakerRequest speakerRequest) {
        SpeakerResponse createdSpeaker = speakerService.createSpeaker(speakerRequest);
        return new ResponseEntity<>(createdSpeaker, HttpStatus.CREATED);
    }

    /**
     * Update an existing speaker by UUID.
     *
     * @param uuid the UUID of the speaker to update
     * @param speakerRequest the updated speaker details
     * @return a ResponseEntity containing the updated speaker's details and HTTP status OK (200), or NOT_FOUND (404) if not found
     */
    @PutMapping("/uuid/{uuid}")
    public ResponseEntity<SpeakerResponse> updateSpeaker(@PathVariable String uuid, @RequestBody SpeakerRequest speakerRequest) {
        SpeakerResponse updatedSpeaker = speakerService.updateSpeaker(uuid, speakerRequest);
        return updatedSpeaker != null ? new ResponseEntity<>(updatedSpeaker, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    /**
     * Delete a speaker by UUID (soft delete).
     *
     * @param uuid the UUID of the speaker to delete
     * @return a ResponseEntity with HTTP status NO_CONTENT (204) if successful, or NOT_FOUND (404) if not found
     */
    @DeleteMapping("/uuid/{uuid}")
    public ResponseEntity<Void> deleteSpeaker(@PathVariable String uuid) {
        try {
            speakerService.deleteSpeaker(uuid);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
