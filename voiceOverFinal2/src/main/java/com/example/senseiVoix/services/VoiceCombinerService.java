package com.example.senseiVoix.services;

import java.util.Map;

public interface VoiceCombinerService {
    Map<String, Object> getCombinedVoices(
            String nextPageToken,
            Integer pageSize,
            String search,
            String sort,
            String sortDirection,
            String voiceType,
            String category,
            String fineTuningState,
            Boolean includeTotalCount,
            // Added parameters for shared voices
            String gender,
            String age,
            String accent,
            String language
    );
}
