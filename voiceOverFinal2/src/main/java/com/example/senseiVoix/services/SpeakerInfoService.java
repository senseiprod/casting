package com.example.senseiVoix.services;


import com.example.senseiVoix.entities.SpeakerInfo;

public interface SpeakerInfoService {
    SpeakerInfo saveSpeaker(com.example.senseiVoix.dtos.SpeakerInfo.SpeakerInfo speakerDTO);
}

