package com.example.senseiVoix.services;

import com.example.senseiVoix.dtos.speaker.SpeakerProfileResponse;

public interface SpeakerProfileService {
    SpeakerProfileResponse getSpeakerProfile(String uuid);
    SpeakerProfileResponse getSpeakerProfileWithStatistics(String uuid);
    void initializeSpeakerWithDarijaLanguage(String speakerUuid);
}
