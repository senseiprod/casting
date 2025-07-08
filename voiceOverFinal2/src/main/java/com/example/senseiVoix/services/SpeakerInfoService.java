package com.example.senseiVoix.services;


import com.example.senseiVoix.entities.SpeakerInfo;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface SpeakerInfoService {
    SpeakerInfo saveSpeaker(com.example.senseiVoix.dtos.SpeakerInfo.SpeakerInfo speakerDTO, MultipartFile audioFile) throws IOException;
}

