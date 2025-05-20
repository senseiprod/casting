package com.example.senseiVoix.services;

import com.example.senseiVoix.dtos.voix.VoixResponsePH;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Nullable;
import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface PlayHtService {
    /**
     * Simple version with text, voice, and language
     */
    byte[] synthesizeSpeech(String text, String voice, String language);

    /**
     * Full version with all parameters for PlayHT API
     */
    byte[] synthesizeSpeech(
            String text,
            String voice,
            String language,
            @Nullable String quality,
            @Nullable String outputFormat,
            @Nullable Float speed,
            @Nullable Integer sampleRate,
            @Nullable Integer seed,
            @Nullable Float temperature,
            @Nullable String voiceEngine,
            @Nullable String emotion,
            @Nullable Integer voiceGuidance,
            @Nullable Integer styleGuidance,
            @Nullable Float textGuidance
    );

    List<Map<String, Object>> getClonedVoices() throws IOException;

    List<Map<String, Object>> getVoices() throws IOException;

    /**
     * 1 Cloner une voix en envoyant un fichier audio
     */
    VoixResponsePH cloneVoiceFromFile(MultipartFile file, String voiceName) throws IOException;

    /**
     * 2 Cloner une voix en envoyant l'URL d'un fichier audio
     */
    String cloneVoiceFromUrl(String fileUrl, String voiceName) throws IOException;

    String deleteClonedVoice(String voiceId);
}
