// Implement the service
package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.services.ElevenLabsService;
import com.example.senseiVoix.services.PlayHtService;
import com.example.senseiVoix.services.VoiceCombinerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class VoiceCombinerServiceImpl implements VoiceCombinerService {

    private final ElevenLabsService elevenLabsService;
    private final PlayHtService playHtService;

    @Autowired
    public VoiceCombinerServiceImpl(ElevenLabsService elevenLabsService, PlayHtService playHtService) {
        this.elevenLabsService = elevenLabsService;
        this.playHtService = playHtService;
    }

    @Override
    public Map<String, Object> getCombinedVoices(
            String nextPageToken,
            Integer pageSize,
            String search,
            String sort,
            String sortDirection,
            String voiceType,
            String category,
            String fineTuningState,
            Boolean includeTotalCount,
            String gender,
            String age,
            String accent,
            String language) {

        // Get voices from ElevenLabs
        Map<String, Object> elevenLabsResponse = elevenLabsService.listVoices(
                nextPageToken, pageSize, search, sort, sortDirection,
                voiceType, category, fineTuningState, includeTotalCount);

        // Get shared voices from ElevenLabs
        // For pagination, we'll use a default page value of 1 if nextPageToken isn't specified
        int sharedVoicesPage = 1;
        if (nextPageToken != null && !nextPageToken.isEmpty()) {
            try {
                sharedVoicesPage = Integer.parseInt(nextPageToken);
            } catch (NumberFormatException e) {
                // Keep default value if parsing fails
            }
        }

        Map<String, Object> sharedVoicesResponse = elevenLabsService.listSharedVoices(
                pageSize, search, sort, category, gender, age, accent, language, sharedVoicesPage);

        // Get voices from PlayHT
        List<Map<String, Object>> playHtVoices;
        try {
            playHtVoices = playHtService.getVoices();
        } catch (IOException e) {
            playHtVoices = new ArrayList<>();
            // Log the error
            System.err.println("Error fetching PlayHT voices: " + e.getMessage());
        }

        // Standardize ElevenLabs voices
        List<Map<String, Object>> elevenLabsVoices = (List<Map<String, Object>>) elevenLabsResponse.get("voices");
        List<Map<String, Object>> standardizedElevenLabsVoices = new ArrayList<>();
        if (elevenLabsVoices != null) {
            for (Map<String, Object> voice : elevenLabsVoices) {
                standardizedElevenLabsVoices.add(standardizeElevenLabsVoice(voice, "elevenlabs"));
            }
        }

        // Standardize ElevenLabs shared voices
        List<Map<String, Object>> elevenLabsSharedVoices = new ArrayList<>();
        List<Map<String, Object>> standardizedElevenLabsSharedVoices = new ArrayList<>();
        if (sharedVoicesResponse != null && sharedVoicesResponse.containsKey("voices")) {
            elevenLabsSharedVoices = (List<Map<String, Object>>) sharedVoicesResponse.get("voices");
            for (Map<String, Object> voice : elevenLabsSharedVoices) {
                standardizedElevenLabsSharedVoices.add(standardizeElevenLabsStandardVoice(voice));
            }
        }

        // Standardize PlayHT voices
        List<Map<String, Object>> standardizedPlayHtVoices = new ArrayList<>();
        if (playHtVoices != null) {
            for (Map<String, Object> voice : playHtVoices) {
                // Only include PlayHT voices with IDs starting with "s3://"
                Object voiceId = voice.get("id");
                if (voiceId != null && voiceId.toString().startsWith("s3://")) {
                    standardizedPlayHtVoices.add(standardizePlayHtVoice(voice));
                }
            }
        }

        // Combine all standardized voices
        List<Map<String, Object>> combinedVoices = new ArrayList<>();
        combinedVoices.addAll(standardizedElevenLabsVoices);
        combinedVoices.addAll(standardizedElevenLabsSharedVoices);
        combinedVoices.addAll(standardizedPlayHtVoices);

        // Create the combined response
        Map<String, Object> combinedResponse = new HashMap<>();
        combinedResponse.put("voices", combinedVoices);

        // Copy relevant metadata from ElevenLabs response
        for (String key : elevenLabsResponse.keySet()) {
            if (!key.equals("voices")) {
                combinedResponse.put(key, elevenLabsResponse.get(key));
            }
        }

        // Add total count if needed
        if (includeTotalCount != null && includeTotalCount) {
            int totalCount = combinedVoices.size();
            combinedResponse.put("total_count", totalCount);
        }

        return combinedResponse;
    }

    /**
     * Standardize ElevenLabs voice structure
     */
    private Map<String, Object> standardizeElevenLabsVoice(Map<String, Object> originalVoice, String voiceType) {
        Map<String, Object> standardized = new HashMap<>();

        // Common identifier
        standardized.put("voice_id", originalVoice.get("voice_id"));

        // Basic information
        standardized.put("name", originalVoice.get("name"));
        standardized.put("description", originalVoice.get("description"));
        standardized.put("preview_url", originalVoice.get("preview_url"));

        // Get labels from the correct nesting level
        Map<String, Object> labels = (Map<String, Object>) originalVoice.get("labels");
        if (labels != null) {
            // Voice characteristics
            standardized.put("gender", labels.get("gender"));
            standardized.put("age", labels.get("age"));
            standardized.put("accent", labels.get("accent"));
            standardized.put("language", labels.get("language"));
            standardized.put("descriptive", labels.get("descriptive"));
            standardized.put("use_case", labels.get("use_case"));
        }

        // Category
        standardized.put("category", originalVoice.get("category"));

        // Source type identifier
        standardized.put("type_voice", voiceType);

        return standardized;
    }

    /**
     * Standardize ElevenLabs shared voice structure
     */
    private Map<String, Object> standardizeElevenLabsStandardVoice(Map<String, Object> originalVoice) {
        Map<String, Object> standardized = new HashMap<>();

        // Common identifier
        standardized.put("voice_id", originalVoice.get("voice_id"));

        // Basic information
        standardized.put("name", originalVoice.get("name"));
        standardized.put("description", originalVoice.get("description"));
        standardized.put("preview_url", originalVoice.get("preview_url"));

        // Voice characteristics - these are usually at top level in shared voices
        standardized.put("gender", originalVoice.get("gender"));
        standardized.put("age", originalVoice.get("age"));
        standardized.put("accent", originalVoice.get("accent"));
        standardized.put("language", originalVoice.get("language"));
        standardized.put("descriptive", originalVoice.get("descriptive"));
        standardized.put("use_case", originalVoice.get("use_case"));

        // Category
        standardized.put("category", originalVoice.get("category"));

        // Source type identifier
        standardized.put("type_voice", "elevenlabs-standard");

        return standardized;
    }

    /**
     * Standardize PlayHT voice structure
     */
    private Map<String, Object> standardizePlayHtVoice(Map<String, Object> originalVoice) {
        Map<String, Object> standardized = new HashMap<>();


        Object voiceId = originalVoice.get("id");
        standardized.put("voice_id", voiceId);

        // Basic information
        standardized.put("name", originalVoice.get("name"));
        standardized.put("description", originalVoice.get("style")); // Using style as description since PlayHT doesn't have a dedicated field
        standardized.put("preview_url", originalVoice.get("sample")); // PlayHT uses "sample" instead of "preview_url"

        // Voice characteristics
        standardized.put("gender", originalVoice.get("gender"));
        standardized.put("age", originalVoice.get("age"));
        standardized.put("accent", originalVoice.get("accent"));
        standardized.put("language", originalVoice.get("language_code"));
        standardized.put("descriptive", originalVoice.get("style"));

        // No direct equivalent for category and use_case, but can use style/texture as an approximation
        standardized.put("category", "general");
        standardized.put("use_case", originalVoice.get("style"));

        // Source type identifier
        standardized.put("type_voice", "playht");

        return standardized;
    }
}
