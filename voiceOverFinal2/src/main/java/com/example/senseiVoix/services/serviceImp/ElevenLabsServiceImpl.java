package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.entities.Voix2;
import com.example.senseiVoix.enumeration.TypeQualityVoix;
import com.example.senseiVoix.enumeration.TypeVoice;
import com.example.senseiVoix.repositories.Voix2Repository;
import com.example.senseiVoix.services.ElevenLabsService;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ElevenLabsServiceImpl implements ElevenLabsService {

    @Value("${elevenlabs.api.key}")
    private String apiKey;

    private static final String ELEVEN_LABS_BASE_URL = "https://api.elevenlabs.io";
    private static final String ELEVEN_LABS_VOICES_ADD_URL = ELEVEN_LABS_BASE_URL + "/v1/voices/add";
    private static final String ELEVEN_LABS_TTS_URL = ELEVEN_LABS_BASE_URL + "/v1/text-to-speech/";
    private static final String ELEVEN_LABS_VOICES_LIST_URL = ELEVEN_LABS_BASE_URL + "/v2/voices";
    private static final String ELEVEN_LABS_VOICES_DELETE_URL = ELEVEN_LABS_BASE_URL + "/v1/voices/";
    private static final String ELEVEN_LABS_SHARED_VOICES_LIST_URL = ELEVEN_LABS_BASE_URL + "/v1/shared-voices";
    private static final int PAGE_SIZE = 100;
    private static final int MAX_VOICES = 5000;

    private final RestTemplate restTemplate;
    @Autowired
    private Voix2Repository Voix2Repository;

    public ElevenLabsServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public Map<String, Object> createVoiceClone(String name, MultipartFile[] files, boolean removeBackgroundNoise, String description, String labels) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("xi-api-key", apiKey);
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("name", name);

        for (MultipartFile file : files) {
            body.add("files", file.getResource());
        }

        if (removeBackgroundNoise) {
            body.add("remove_background_noise", String.valueOf(true));
        }
        if (description != null) {
            body.add("description", description);
        }
        if (labels != null) {
            body.add("labels", labels);
        }

        ResponseEntity<Map> response = restTemplate.postForEntity(
                ELEVEN_LABS_VOICES_ADD_URL,
                new HttpEntity<>(body, headers),
                Map.class
        );

        return response.getBody();
    }

    @Override
    public byte[] textToSpeech(String voiceId, String outputFormat, boolean enableLogging,
                               Integer optimizeStreamingLatency, Map<String, Object> requestBody) {

        // Build the URL with query parameters
        UriComponentsBuilder uriBuilder = UriComponentsBuilder
                .fromUriString(ELEVEN_LABS_TTS_URL + voiceId)
                .queryParam("output_format", outputFormat)
                .queryParam("enable_logging", enableLogging);

        if (optimizeStreamingLatency != null) {
            uriBuilder.queryParam("optimize_streaming_latency", optimizeStreamingLatency);
        }

        String ttsUrl = uriBuilder.toUriString();

        // Set up headers
        HttpHeaders headers = new HttpHeaders();
        headers.set("xi-api-key", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create the request entity with body and headers
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        // Make the request and get byte[] response
        ResponseEntity<byte[]> response = restTemplate.exchange(
                ttsUrl,
                HttpMethod.POST,
                requestEntity,
                byte[].class
        );

        return response.getBody();
    }

    @Override
    public Map<String, Object> listVoices(
            String nextPageToken,
            Integer pageSize,
            String search,
            String sort,
            String sortDirection,
            String voiceType,
            String category,
            String fineTuningState,
            Boolean includeTotalCount) {

        // Build URL with query parameters
        UriComponentsBuilder uriBuilder = UriComponentsBuilder
                .fromUriString(ELEVEN_LABS_VOICES_LIST_URL);

        // Add optional query parameters if they are provided
        if (nextPageToken != null) {
            uriBuilder.queryParam("next_page_token", nextPageToken);
        }

        if (pageSize != null) {
            uriBuilder.queryParam("page_size", pageSize);
        }

        if (search != null) {
            uriBuilder.queryParam("search", search);
        }

        if (sort != null) {
            uriBuilder.queryParam("sort", sort);
        }

        if (sortDirection != null) {
            uriBuilder.queryParam("sort_direction", sortDirection);
        }

        if (voiceType != null) {
            uriBuilder.queryParam("voice_type", voiceType);
        }

        if (category != null) {
            uriBuilder.queryParam("category", category);
        }

        if (fineTuningState != null) {
            uriBuilder.queryParam("fine_tuning_state", fineTuningState);
        }

        if (includeTotalCount != null) {
            uriBuilder.queryParam("include_total_count", includeTotalCount);
        }

        String listVoicesUrl = uriBuilder.toUriString();

        // Set up headers
        HttpHeaders headers = new HttpHeaders();
        headers.set("xi-api-key", apiKey);

        // Create the request entity with headers
        HttpEntity<?> requestEntity = new HttpEntity<>(headers);

        // Make the request and get response
        ResponseEntity<Map> response = restTemplate.exchange(
                listVoicesUrl,
                HttpMethod.GET,
                requestEntity,
                Map.class
        );

        return response.getBody();
    }

    @Override
    public Map<String, Object> listSharedVoices(
            Integer pageSize,
            String search,
            String sort,
            String category,
            String gender,
            String age,
            String accent,
            String language,
            int nextPageToken // NEW parameter
    ) {
        int index = 1; // Initialize index for voice name generation
        UriComponentsBuilder uriBuilder = UriComponentsBuilder
                .fromUriString(ELEVEN_LABS_SHARED_VOICES_LIST_URL);
    
        if (pageSize != null) uriBuilder.queryParam("page_size", pageSize);
        if (search != null) uriBuilder.queryParam("search", search);
        if (sort != null) uriBuilder.queryParam("sort", sort);
        if (category != null) uriBuilder.queryParam("category", category);
        if (gender != null) uriBuilder.queryParam("gender", gender);
        if (age != null) uriBuilder.queryParam("age", age);
        if (accent != null) uriBuilder.queryParam("accent", accent);
        if (language != null) uriBuilder.queryParam("language", language);
        if (nextPageToken != 0) uriBuilder.queryParam("page", nextPageToken); // pagination
    
        String listVoicesUrl = uriBuilder.toUriString();
    
        HttpHeaders headers = new HttpHeaders();
        headers.set("xi-api-key", apiKey);
    
        HttpEntity<?> requestEntity = new HttpEntity<>(headers);
    
        ResponseEntity<Map> response = restTemplate.exchange(
                listVoicesUrl,
                HttpMethod.GET,
                requestEntity,
                Map.class
        );
    
        // Modify the response body
        Map<String, Object> responseBody = response.getBody();
        if (responseBody != null && responseBody.containsKey("voices")) {
            Object voicesObj = responseBody.get("voices");
            if (voicesObj instanceof List) {
                List<Map<String, Object>> voices = (List<Map<String, Object>>) voicesObj;
                for (Map<String, Object> voice : voices) {
                    if (voice.containsKey("name")) {
                        String generatedName = String.format("%05d", index++);; // Replace with your logic
                        voice.put("name", generatedName);
                    }
                }
            }
        }
    
        return responseBody;
    }
    
    // Example method to generate a new voice name
    private String generateNewVoiceName(String originalName) {
        return "Generated_" + originalName; // Replace with your actual logic
    }


    @Override
    public Map<String, String> deleteVoice(String voiceId) {
        // Build the URL
        String deleteVoiceUrl = ELEVEN_LABS_VOICES_DELETE_URL + voiceId;

        // Set up headers
        HttpHeaders headers = new HttpHeaders();
        headers.set("xi-api-key", apiKey);

        // Create the request entity with headers
        HttpEntity<?> requestEntity = new HttpEntity<>(headers);

        // Make the DELETE request
        ResponseEntity<Map> response = restTemplate.exchange(
                deleteVoiceUrl,
                HttpMethod.DELETE,
                requestEntity,
                Map.class
        );

        // Convert to Map<String, String> as the response only contains a status field
        Map<String, String> result = new HashMap<>();
        if (response.getBody() != null) {
            // Fix: Use Map.forEach with lambda to avoid the entry type issue
            response.getBody().forEach((key, value) ->
                    result.put((String) key, value != null ? value.toString() : null)
            );
        }

        return result;
    }
@Override
public ByteArrayResource generateVoiceNamesExcel() throws Exception {
    int pageSize = 100;
    int totalVoicesToFetch = 5000;
    int voicesFetched = 0;
    int nextPageToken = 0;

    List<String> voiceNames = new ArrayList<>();
    List<String> voiceurl = new ArrayList<>();
    List<String> languages = new ArrayList<>();
    
    while (voicesFetched < totalVoicesToFetch) {
        Map<String, Object> response = listSharedVoices(
                pageSize,
                null, null, null, null, null, null, null,
                nextPageToken
        );
        List<Map<String, Object>> voices = (List<Map<String, Object>>) response.get("voices");
        if (voices == null || voices.isEmpty()) break;

        for (Map<String, Object> voice : voices) {
            String name = (String) voice.get("name");
            String url = (String) voice.get("preview_url");
            String language = (String) voice.get("language");
            voiceurl.add(url);
            voiceNames.add(name);
            languages.add(language);
            voicesFetched++;
            if (voicesFetched >= totalVoicesToFetch) break;
        }

         nextPageToken++;
    }

    Workbook workbook = new XSSFWorkbook();
    Sheet sheet = workbook.createSheet("Voice Names");

    for (int i = 0; i < voiceNames.size(); i++) {
        org.apache.poi.ss.usermodel.Row row = sheet.createRow(i);
        org.apache.poi.ss.usermodel.Cell cell = row.createCell(0);
        org.apache.poi.ss.usermodel.Cell cell2 = row.createCell(2);
        org.apache.poi.ss.usermodel.Cell cell3 = row.createCell(1);
        cell.setCellValue(voiceNames.get(i));
        cell2.setCellValue(voiceurl.get(i));
        cell3.setCellValue(languages.get(i));
    }

    ByteArrayOutputStream out = new ByteArrayOutputStream();
    workbook.write(out);
    workbook.close();

    return new ByteArrayResource(out.toByteArray());
}
@Override
public void fetchAndSaveVoicesFromElevenLabs() {
        int voicesFetched = 0;
        String nextPageToken = null;
        int index = 1;

        while (voicesFetched < MAX_VOICES) {
            Map<String, Object> response = listSharedVoices(PAGE_SIZE, nextPageToken, nextPageToken, nextPageToken, nextPageToken, nextPageToken, nextPageToken, nextPageToken, index);
            List<Map<String, Object>> voices = (List<Map<String, Object>>) response.get("voices");

            for (Map<String, Object> voiceData : voices) {
                String voiceId = (String) voiceData.get("voice_id");
                String language = (String) ((Map<String, Object>) voiceData.get("fine_tuning")).get("language");
                String gender = "unknown"; // Mettre à jour si possible depuis les métadonnées
                String previewUrl = (String) voiceData.get("preview_url");

                // Génération d’un nom unique
                String generatedName = "Voice_" + String.format("%05d", index++);

                // Créer une instance de Voix2
                Voix2 voix = new Voix2();
                voix.setElevenlabs_id(voiceId);
                voix.setLanguage(language);
                voix.setGender(gender);
                voix.setName(generatedName);
                voix.setPrice(1.0); // ou une logique de calcul
                voix.setNombrePoint(10.0); // ou logique métier
                voix.setType(TypeQualityVoix.NORMAL); // ou selon qualité
                voix.setTypeVoice(TypeVoice.ANGRY); // ou autre
                voix.setSpeaker(null); // ou un speaker par défaut
                voix.setPreview(previewUrl);
                Voix2Repository.save(voix);
                voicesFetched++;

                if (voicesFetched >= MAX_VOICES) break;
            }

            nextPageToken = (String) response.get("next_page_token");
            if (nextPageToken == null) break;
        }
    }
}
