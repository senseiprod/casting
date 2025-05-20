package com.example.senseiVoix.services;

import com.example.senseiVoix.dtos.audio.AudioRequest;
import com.example.senseiVoix.dtos.audio.AudioResponse;
import com.example.senseiVoix.dtos.audio.ResponseAudio;

import java.util.List;

public interface AudioService {

    AudioResponse createAudio(AudioRequest audioRequest);

    AudioResponse getAudioById(Long id);

    List<ResponseAudio> getAllAudiosBySpeaker(String speakerId);

    AudioResponse updateAudio(Long id, AudioRequest audioRequest);

    void deleteAudio(Long id);

    List<AudioResponse> getAllAudios();



}
