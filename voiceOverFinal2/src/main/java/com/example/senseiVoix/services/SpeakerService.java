package com.example.senseiVoix.services;


import com.example.senseiVoix.dtos.speacker.SpeakerRequest;
import com.example.senseiVoix.dtos.speacker.SpeakerResponse;
import com.example.senseiVoix.entities.Speaker;

import java.util.List;
import java.util.Optional;

public interface SpeakerService {
    List<SpeakerResponse> getAllSpeakers();
    Optional<Speaker> getSpeakerById(Long id);
    SpeakerResponse getSpeakerByUuid(String uuid);
    SpeakerResponse getSpeakerByEmail(String email);
    List<SpeakerResponse> getSpeakersByEarnings(Double earnings);
    List<SpeakerResponse> getSpeakersNotDeleted();
    List<SpeakerResponse> getSpeakersDeleted();
    SpeakerResponse createSpeaker(SpeakerRequest speaker);
    SpeakerResponse updateSpeaker(String uuid, SpeakerRequest speaker);

    List<SpeakerResponse> searchByName(String name);

    void deleteSpeaker(String uuid);
}

