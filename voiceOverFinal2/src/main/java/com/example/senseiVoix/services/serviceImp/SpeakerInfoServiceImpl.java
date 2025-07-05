package com.example.senseiVoix.services.serviceImp;



import com.example.senseiVoix.dtos.SpeakerInfo.SpeakerInfo;
import com.example.senseiVoix.repositories.SpeakerInfoRepository;
import com.example.senseiVoix.services.SpeakerInfoService;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;



@Service
public class SpeakerInfoServiceImpl implements SpeakerInfoService {

    private final SpeakerInfoRepository speakerRepository;

    @Autowired
    public SpeakerInfoServiceImpl(SpeakerInfoRepository speakerInfoRepository) {
        this.speakerRepository = speakerInfoRepository;
    }

    @Override
    public com.example.senseiVoix.entities.SpeakerInfo saveSpeaker(SpeakerInfo dto) {
        com.example.senseiVoix.entities.SpeakerInfo speaker = new com.example.senseiVoix.entities.SpeakerInfo();
        speaker.setFullName(dto.getFullName());
        speaker.setArtistName(dto.getArtistName());
        speaker.setEmail(dto.getEmail());
        speaker.setPhone(dto.getPhone());

        return speakerRepository.save(speaker);
    }

}