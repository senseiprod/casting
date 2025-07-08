package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.SpeakerInfo.SpeakerInfo;
import com.example.senseiVoix.repositories.SpeakerInfoRepository;
import com.example.senseiVoix.services.SpeakerInfoService;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException; // Import IOException

@Service
public class SpeakerInfoServiceImpl implements SpeakerInfoService {

    private final SpeakerInfoRepository speakerRepository;

    @Autowired
    public SpeakerInfoServiceImpl(SpeakerInfoRepository speakerInfoRepository) {
        this.speakerRepository = speakerInfoRepository;
    }

    @Override
    // FIX: Add 'throws IOException' to the method signature to handle the checked exception from getBytes().
    public com.example.senseiVoix.entities.SpeakerInfo saveSpeaker(SpeakerInfo dto, MultipartFile audioFile) throws IOException {
        com.example.senseiVoix.entities.SpeakerInfo speakerEntity = new com.example.senseiVoix.entities.SpeakerInfo();

        // --- Map all fields from DTO to Entity ---
        speakerEntity.setFullName(dto.getFullName());
        speakerEntity.setArtistName(dto.getArtistName());
        speakerEntity.setEmail(dto.getEmail());
        speakerEntity.setPhone(dto.getPhone());
        speakerEntity.setBirthdate(dto.getBirthdate());
        speakerEntity.setLocation(dto.getLocation());
        speakerEntity.setCurrentJob(dto.getCurrentJob());
        speakerEntity.setExperienceYears(dto.getExperienceYears());
        speakerEntity.setLangArabicClassical(dto.isLangArabicClassical());
        speakerEntity.setLangDarija(dto.isLangDarija());
        speakerEntity.setLangFrench(dto.isLangFrench());
        speakerEntity.setLangEnglish(dto.isLangEnglish());
        speakerEntity.setLangSpanish(dto.isLangSpanish());
        speakerEntity.setOtherLanguages(dto.getOtherLanguages());
        speakerEntity.setVoiceFemale(dto.isVoiceFemale());
        speakerEntity.setVoiceMale(dto.isVoiceMale());
        speakerEntity.setVoiceTeenChild(dto.isVoiceTeenChild());
        speakerEntity.setVoiceSenior(dto.isVoiceSenior());
        speakerEntity.setVoiceNeutral(dto.isVoiceNeutral());
        speakerEntity.setVoiceDeep(dto.isVoiceDeep());
        speakerEntity.setVoiceDynamic(dto.isVoiceDynamic());
        speakerEntity.setVoiceOther(dto.getVoiceOther());
        speakerEntity.setDemoLink(dto.getDemoLink());

        // Handle the audio file
        if (audioFile != null && !audioFile.isEmpty()) {
            speakerEntity.setDemoAudio(audioFile.getBytes()); // This line is the source of the IOException
            speakerEntity.setDemoAudioType(audioFile.getContentType());
        }

        speakerEntity.setHasStudio("yes".equalsIgnoreCase(dto.getHasStudio()));
        speakerEntity.setStudioDescription(dto.getStudioDescription());
        speakerEntity.setProfessionalExperience(dto.getProfessionalExperience());
        speakerEntity.setSocialLinks(dto.getSocialLinks());
        speakerEntity.setVoiceCloningConsent("yes".equalsIgnoreCase(dto.getVoiceCloningConsent()));
        speakerEntity.setAgreeTerms(dto.isAgreeTerms());
        speakerEntity.setDigitalSignature(dto.getDigitalSignature());
        speakerEntity.setSignatureDate(dto.getSignatureDate());

        return speakerRepository.save(speakerEntity);
    }
}