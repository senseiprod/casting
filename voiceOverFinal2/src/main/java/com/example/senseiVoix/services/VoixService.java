package com.example.senseiVoix.services;
import com.example.senseiVoix.dtos.voix.VoixRequest;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.entities.Voix;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface VoixService {

    Voix createVoice(MultipartFile file, String voiceName, Utilisateur user, String gender, String language, Double price) throws IOException;

    Optional<Voix> getVoiceById(Long id);

    List<Voix> getAllVoices();

    List<Voix> findAllBySpeaker(String uuid);



    Voix findByUuid(String id);

    List<Voix> findAll();

    Voix updateVoice(Long id, VoixRequest voixRequest);

    boolean deleteVoice(Long id);
}
