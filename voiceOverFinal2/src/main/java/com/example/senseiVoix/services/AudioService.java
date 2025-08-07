package com.example.senseiVoix.services;

import com.example.senseiVoix.dtos.audio.AudioRequest;
import com.example.senseiVoix.dtos.audio.AudioResponse;
import com.example.senseiVoix.dtos.audio.ResponseAudio;
import com.example.senseiVoix.enumeration.TypeAudio;

import java.util.List;

public interface AudioService {

    AudioResponse createAudio(AudioRequest audioRequest);

    AudioResponse getAudioById(Long id);

    List<ResponseAudio> getAllAudiosBySpeaker(String speakerId);

    AudioResponse updateAudio(Long id, AudioRequest audioRequest);

    void deleteAudio(Long id);

    List<AudioResponse> getAllAudios();

    List<AudioResponse> getAudiosBySpeaker(String speakerUuid);
    List<AudioResponse> getAudiosByType(TypeAudio typeAudio);
    List<AudioResponse> getAudiosBySpeakerAndType(String speakerUuid, TypeAudio typeAudio);
    Long getTotalAudioSizeBySpeaker(String speakerUuid);
    Integer getAudioCountBySpeaker(String speakerUuid);
}

