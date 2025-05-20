package com.example.senseiVoix.services;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;


public interface ElevenLabsService {




        Map<String, Object> createVoiceClone(String name, MultipartFile[] files, boolean removeBackgroundNoise, String description, String labels);

        byte[] textToSpeech(String voiceId, String outputFormat, boolean enableLogging, Integer optimizeStreamingLatency, Map<String, Object> requestBody);

        Map<String, Object> listVoices(
                String nextPageToken,
                Integer pageSize,
                String search,
                String sort,
                String sortDirection,
                String voiceType,
                String category,
                String fineTuningState,
                Boolean includeTotalCount);

        Map<String, String> deleteVoice(String voiceId);

    Map<String, Object> listSharedVoices(Integer pageSize, String search, String sort, String category, String gender, String age, String accent, String language,int nextPageToken );
ByteArrayResource generateVoiceNamesExcel() throws Exception;

}
