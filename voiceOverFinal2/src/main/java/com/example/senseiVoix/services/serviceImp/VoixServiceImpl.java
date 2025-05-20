package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.voix.VoixRequest;
import com.example.senseiVoix.entities.Speaker;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.entities.Voix;
import com.example.senseiVoix.enumeration.TypeQualityVoix;
import com.example.senseiVoix.repositories.VoixRepository;
import com.example.senseiVoix.services.PlayHtService;
import com.example.senseiVoix.services.VoixService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class VoixServiceImpl implements VoixService {

    private final VoixRepository voixRepository;
    private final PlayHtService playHtService;

    public VoixServiceImpl(VoixRepository voixRepository, PlayHtService playHtService) {
        this.voixRepository = voixRepository;
        this.playHtService = playHtService;
    }

    @Override
    public Voix createVoice(MultipartFile file, String voiceName, Utilisateur user, String gender, String language, Double price) throws IOException {
        Voix voix = new Voix();
        voix.setSpeaker((Speaker) user);
        voix.setNombrePoint(0.0);
        voix.setGender(gender);
        voix.setLanguage(language);
        voix.setPrice(price);


        // or calculate points if needed

        return voixRepository.save(voix); // Save to the database
    }

    @Override
    public Optional<Voix> getVoiceById(Long id) {
        return voixRepository.findById(id);
    }

    @Override
    public List<Voix> getAllVoices() {
        return voixRepository.findAll();
    }

    @Override
    public Voix updateVoice(Long id, VoixRequest voixRequest) {
        return voixRepository.findById(id).map(voix -> {

            voix.setGender(voixRequest.getGender());
            voix.setLanguage(voixRequest.getLanguage());
            voix.setPrice(voixRequest.getPrice());
            voix.setUrl(voixRequest.getUrl());
            voix.setName(voixRequest.getName());
            voix.setType(TypeQualityVoix.HIEGHT);
            return voixRepository.save(voix);
        }).orElseThrow(() -> new RuntimeException("Voice not found with id: " + id));
    }

    @Override
    public boolean deleteVoice(Long id) {
        if (voixRepository.existsById(id)) {
            voixRepository.deleteById(id);
            return true;
        }
        return false;
    }
    @Override
    public List<Voix> findAllBySpeaker(String uuid) {
        return voixRepository.findBySpeaker(uuid);
    }
    @Override
    public Voix findByUuid(String id) {  // Changed from getVoiceById
        return voixRepository.findByUuid(id);
    }

    @Override
    public List<Voix> findAll() {  // Changed from getAllVoices
        return voixRepository.findAll();
    }


}
