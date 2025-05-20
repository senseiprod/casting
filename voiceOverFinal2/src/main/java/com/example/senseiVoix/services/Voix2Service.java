package com.example.senseiVoix.services;

import com.example.senseiVoix.dtos.voix2.Voix2Request;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.entities.Voix2;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface Voix2Service {

    Voix2 createVoice(MultipartFile files,
                      String name,
                      Utilisateur user,
                      String gender,
                      String language,
                      Double price,
                      boolean removeBackgroundNoise,
                      String description,
                      String labels) throws IOException;

    Optional<Voix2> getVoiceById(Long id);

    List<Voix2> getAllVoices();

    List<Voix2> findAllBySpeaker(String uuid);



    Voix2 findByUuid(String id);

    List<Voix2> findAll();

    Voix2 updateVoice(Long id, Voix2Request voixRequest);

    boolean deleteVoice(Long id);
}
