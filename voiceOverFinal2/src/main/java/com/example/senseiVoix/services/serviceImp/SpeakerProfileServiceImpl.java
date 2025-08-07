package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.audio.AudioResponse;
import com.example.senseiVoix.dtos.language.LanguageResponse;
import com.example.senseiVoix.dtos.speaker.SpeakerProfileResponse;
import com.example.senseiVoix.dtos.voix.VoixResponse;
import com.example.senseiVoix.entities.Audio;
import com.example.senseiVoix.entities.Language;
import com.example.senseiVoix.entities.Speaker;
import com.example.senseiVoix.entities.Voix;
import com.example.senseiVoix.entities.Voix2;
import com.example.senseiVoix.repositories.LanguageRepository;
import com.example.senseiVoix.repositories.SpeakerRepository;
import com.example.senseiVoix.services.SpeakerProfileService;
import com.example.senseiVoix.services.AudioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SpeakerProfileServiceImpl implements SpeakerProfileService {

    @Autowired
    private SpeakerRepository speakerRepository;

    @Autowired
    private LanguageRepository languageRepository;

    @Autowired
    private AudioService audioService;

    @Override
    public SpeakerProfileResponse getSpeakerProfile(String uuid) {
        Speaker speaker = speakerRepository.findByUuid(uuid);
        if (speaker == null) {
            return null;
        }

        return mapToSpeakerProfileResponse(speaker);
    }

    @Override
    public SpeakerProfileResponse getSpeakerProfileWithStatistics(String uuid) {
        Speaker speaker = speakerRepository.findByUuid(uuid);
        if (speaker == null) {
            return null;
        }

        SpeakerProfileResponse response = mapToSpeakerProfileResponse(speaker);
        
        // Add statistics using AudioService
        response.setTotalAudios(audioService.getAudioCountBySpeaker(uuid));
        response.setTotalVoices(speaker.getVoix() != null ? speaker.getVoix().size() : 0);
        response.setTotalLanguages(speaker.getLanguages() != null ? speaker.getLanguages().size() : 0);
        response.setCompletedProjects(speaker.getProjects() != null ? speaker.getProjects().size() : 0);
        
        // Calculate profile completion status
        response.setProfileCompletionStatus(calculateProfileCompletionStatus(speaker));
        
        return response;
    }

    @Override
    public void initializeSpeakerWithDarijaLanguage(String speakerUuid) {
        Speaker speaker = speakerRepository.findByUuid(speakerUuid);
        if (speaker != null) {
            Language darija = languageRepository.findByCode("ary").orElse(null);
            if (darija != null && !speaker.getLanguages().contains(darija)) {
                speaker.addLanguage(darija);
                speakerRepository.save(speaker);
            }
        }
    }

    private SpeakerProfileResponse mapToSpeakerProfileResponse(Speaker speaker) {
        SpeakerProfileResponse response = new SpeakerProfileResponse();
        
        // Basic information
        response.setUuid(speaker.getUuid());
        response.setNom(speaker.getNom());
        response.setPrenom(speaker.getPrenom());
        response.setUsername(speaker.getUsername());
        response.setEmail(speaker.getEmail());
        response.setPhone(speaker.getPhone());
        response.setCode(speaker.getCode());
        
        // Speaker specific details
        response.setAge(speaker.getAge());
        response.setGender(speaker.getGender());
        response.setEarnings(speaker.getEarnings());
        response.setBanckRib(speaker.getBanckRib());
        response.setPaymentemail(speaker.getPaymentemail());
        response.setActiveTextValidation(speaker.getActiveTextValidation());
        
        // Map languages
        if (speaker.getLanguages() != null) {
            List<LanguageResponse> languageResponses = speaker.getLanguages().stream()
                .map(this::mapToLanguageResponse)
                .collect(Collectors.toList());
            response.setLanguages(languageResponses);
        }
        
        // Map voices
        if (speaker.getVoix() != null) {
            List<VoixResponse> voixResponses = speaker.getVoix().stream()
                .map(this::mapToVoixResponse)
                .collect(Collectors.toList());
            response.setVoix(voixResponses);
        }
        
        // Map audios
        if (speaker.getAudios() != null) {
            List<AudioResponse> audioResponses = speaker.getAudios().stream()
                .map(this::mapToAudioResponse)
                .collect(Collectors.toList());
            response.setAudios(audioResponses);
        }
        
        
        return response;
    }

    private LanguageResponse mapToLanguageResponse(Language language) {
        LanguageResponse response = new LanguageResponse();
        response.setId(language.getId());
        response.setCode(language.getCode());
        response.setName(language.getName());
        response.setNativeName(language.getNativeName());
        response.setRegion(language.getRegion());
        response.setIsActive(language.getIsActive());
        return response;
    }

    private VoixResponse mapToVoixResponse(Voix2 voix) {
        VoixResponse response = new VoixResponse();
        // Map voix properties based on your Voix entity structure
        // This is a placeholder - adjust according to your actual Voix entity
        response.setName(voix.getName());
        return response;
    }

    private AudioResponse mapToAudioResponse(Audio audio) {
        AudioResponse response = new AudioResponse();
        response.setId(audio.getId());
        response.setFormat(audio.getFormat());
        response.setTypeAudio(audio.getTypeAudio());

        // Speaker information
        if (audio.getSpeaker() != null) {
            response.setSpeakerUuid(audio.getSpeaker().getUuid());
            response.setSpeakerName(audio.getSpeaker().getPrenom() + " " + audio.getSpeaker().getNom());
        }

        // Audio file information
        response.setHasAudioFile(audio.getAudioFile() != null && audio.getAudioFile().length > 0);
        if (audio.getAudioFile() != null) {
            response.setFileSizeInBytes((long) audio.getAudioFile().length);
            response.setFileSizeFormatted(formatFileSize(audio.getAudioFile().length));
        }

        return response;
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }

    private String calculateProfileCompletionStatus(Speaker speaker) {
        int completionScore = 0;
        int totalFields = 10;

        if (speaker.getNom() != null && !speaker.getNom().isEmpty()) completionScore++;
        if (speaker.getPrenom() != null && !speaker.getPrenom().isEmpty()) completionScore++;
        if (speaker.getEmail() != null && !speaker.getEmail().isEmpty()) completionScore++;
        if (speaker.getPhone() != null && !speaker.getPhone().isEmpty()) completionScore++;
        if (speaker.getAge() != null) completionScore++;
        if (speaker.getGender() != null && !speaker.getGender().isEmpty()) completionScore++;
        if (speaker.getBanckRib() != null && !speaker.getBanckRib().isEmpty()) completionScore++;
        if (speaker.getLanguages() != null && !speaker.getLanguages().isEmpty()) completionScore++;
        if (speaker.getVoix() != null && !speaker.getVoix().isEmpty()) completionScore++;
        if (speaker.getAudios() != null && !speaker.getAudios().isEmpty()) completionScore++;

        double completionPercentage = (double) completionScore / totalFields * 100;

        if (completionPercentage < 30) return "INCOMPLETE";
        else if (completionPercentage < 70) return "BASIC";
        else if (completionPercentage < 90) return "COMPLETE";
        else return "VERIFIED";
    }
}
