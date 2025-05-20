package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.voix2.Voix2Request;
import com.example.senseiVoix.entities.Speaker;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.entities.Voix2;
import com.example.senseiVoix.enumeration.TypeQualityVoix;
import com.example.senseiVoix.repositories.Voix2Repository;
import com.example.senseiVoix.services.ElevenLabsService;
import com.example.senseiVoix.services.Voix2Service;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class Voix2ServiceImpl implements Voix2Service {

    private final Voix2Repository voix2Repository;
    private final ElevenLabsService elevenLabsService;

    public Voix2ServiceImpl(Voix2Repository voix2Repository, ElevenLabsService elevenLabsService) {
        this.voix2Repository = voix2Repository;
        this.elevenLabsService = elevenLabsService;
    }

    @Override
    public Voix2 createVoice(MultipartFile files, String name, Utilisateur user, String gender,
                             String language, Double price, boolean removeBackgroundNoise,
                             String description, String labels) throws IOException {

        // Convert single file to array for ElevenLabs service
        MultipartFile[] filesArray = new MultipartFile[]{files};

        // Use ElevenLabsService to clone the voice - properly injected and called as instance method
        Map<String, Object> voiceCloneResponse = elevenLabsService.createVoiceClone(
                name, filesArray, removeBackgroundNoise, description, labels);

        // Extract the voice ID from the response
        String voiceId = (String) voiceCloneResponse.get("voice_id");

        // Create and save the new Voix2
        Voix2 voix = new Voix2();

        // Check if the user is a Speaker, if not handle appropriately
        if (user instanceof Speaker) {
            voix.setSpeaker((Speaker) user);
        } else {
            // Handle the case where user is not a Speaker
            throw new IllegalArgumentException("User must be a Speaker");
        }

        voix.setElevenlabs_id(voiceId);
        voix.setNombrePoint(0.0);
        voix.setGender(gender);
        voix.setLanguage(language);
        voix.setPrice(price);
        voix.setName(name);

        // Save to the database
        return voix2Repository.save(voix);
    }


    @Override
    public Optional<Voix2> getVoiceById(Long id) {
        return voix2Repository.findById(id);
    }

    @Override
    public List<Voix2> getAllVoices() {
        return voix2Repository.findAll();
    }

    @Override
    public Voix2 updateVoice(Long id, Voix2Request voixRequest) {
        return voix2Repository.findById(id).map(voix -> {

            voix.setGender(voixRequest.getGender());
            voix.setLanguage(voixRequest.getLanguage());
            voix.setPrice(voixRequest.getPrice());
            voix.setElevenlabs_id(voixRequest.getElevenlabsid());
            voix.setName(voixRequest.getName());
            voix.setType(TypeQualityVoix.HIEGHT);
            return voix2Repository.save(voix);
        }).orElseThrow(() -> new RuntimeException("Voice not found with id: " + id));
    }

    @Override
    public boolean deleteVoice(Long id) {
        if (voix2Repository.existsById(id)) {

            Optional<Voix2> voix = voix2Repository.findById(id);
            elevenLabsService.deleteVoice(voix.get().getElevenlabs_id());
            voix2Repository.deleteById(id);
            return true;
        }
        return false;
    }
    @Override
    public List<Voix2> findAllBySpeaker(String uuid) {
        return voix2Repository.findBySpeaker(uuid);
    }
    @Override
    public Voix2 findByUuid(String id) {  // Changed from getVoiceById
        return voix2Repository.findByUuid(id);
    }

    @Override
    public List<Voix2> findAll() {  // Changed from getAllVoices
        return voix2Repository.findAll();
    }

}
