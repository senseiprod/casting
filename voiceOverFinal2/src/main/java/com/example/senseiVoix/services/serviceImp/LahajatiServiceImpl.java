package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.helpers.MultipartInputStreamFileResource;
import com.example.senseiVoix.services.LahajatiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Slf4j
@Service
@RequiredArgsConstructor
public class LahajatiServiceImpl implements LahajatiService {

    @Value("${lahajati.api.key}")
    private String apiKey;

    @Value("${lahajati.tts.url}")
    private String ttsUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String stsUrl = "https://lahajati.ai/api/v1/speech-to-speech-pro";

    // Helper method to create clean headers for String responses
    private HttpHeaders createCleanHeaders() {
        HttpHeaders cleanHeaders = new HttpHeaders();
        cleanHeaders.setContentType(MediaType.APPLICATION_JSON);
        cleanHeaders.remove("Transfer-Encoding");
        return cleanHeaders;
    }

    // Helper method to create request headers
    private HttpHeaders createRequestHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(MediaType.parseMediaTypes("application/json"));
        headers.setBearerAuth(apiKey);
        headers.set("User-Agent", "SenseiVoix/1.0");
        headers.set("Connection", "close");
        return headers;
    }

    @Override
    public ResponseEntity<byte[]> generateSpeech(Map<String, Object> requestBody) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(MediaType.parseMediaTypes("audio/mpeg"));
            headers.setBearerAuth(apiKey);
            headers.set("Connection", "close"); // Add this to prevent chunked encoding

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<byte[]> response = restTemplate.exchange(ttsUrl, HttpMethod.POST, entity, byte[].class);
        
            // Create clean headers for the response
            HttpHeaders cleanHeaders = new HttpHeaders();
            cleanHeaders.setContentType(MediaType.valueOf("audio/mpeg"));
            cleanHeaders.remove("Transfer-Encoding");
        
            return ResponseEntity.status(response.getStatusCode())
                .headers(cleanHeaders)
                .body(response.getBody());
        } catch (Exception e) {
            log.error("Error generating speech: ", e);
            throw e;
        }
    }

    @Override
    public ResponseEntity<String> getVoices(Optional<Integer> page, Optional<Integer> perPage, Optional<String> gender) {
        try {
            log.info("Getting voices with page: {}, perPage: {}, gender: {}", page, perPage, gender);

            // Load CSV file into Map<display_name, preview_url>
            Map<String, String> previewUrlMap = loadPreviewUrls("voices.csv");

            HttpHeaders headers = createRequestHeaders();

            String url = UriComponentsBuilder
                    .fromHttpUrl("https://lahajati.ai/api/v1/voices-absolute-control")
                    .queryParamIfPresent("page", page)
                    .queryParamIfPresent("per_page", perPage)
                    .queryParamIfPresent("gender", gender)
                    .toUriString();

            log.info("Making request to URL: {}", url);

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            log.info("Response status: {}", response.getStatusCode());

            // Parse JSON response and add preview_url
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());

            if (root.path("success").asBoolean(false)) {
                ArrayNode dataArray = (ArrayNode) root.path("data");
                for (JsonNode voiceNode : dataArray) {
                    String displayName = voiceNode.path("display_name").asText();
                    String previewUrl = previewUrlMap.get(displayName);
                    if (previewUrl != null) {
                        ((ObjectNode) voiceNode).put("preview_url", previewUrl);
                    } else {
                        ((ObjectNode) voiceNode).putNull("preview_url");
                    }
                }
            }

            String modifiedJson = mapper.writeValueAsString(root);

            return ResponseEntity.status(response.getStatusCode())
                    .headers(createCleanHeaders())
                    .body(modifiedJson);

        } catch (HttpClientErrorException e) {
            log.error("Client error getting voices: Status: {}, Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode())
                    .headers(createCleanHeaders())
                    .body("Client error: " + e.getResponseBodyAsString());
        } catch (HttpServerErrorException e) {
            log.error("Server error getting voices: Status: {}, Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode())
                    .headers(createCleanHeaders())
                    .body("Server error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Unexpected error getting voices: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .headers(createCleanHeaders())
                    .body("Unexpected error: " + e.getMessage());
        }
    }

private Map<String, String> loadPreviewUrls(String csvFilePath) throws Exception {
    Map<String, String> map = new HashMap<>();

    try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream(csvFilePath)) {
        if (inputStream == null) {
            throw new FileNotFoundException("File not found: " + csvFilePath);
        }

        try (BufferedReader br = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            boolean firstLine = true;
            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue;
                }
                String[] parts = line.split(",", 2);
                if (parts.length == 2) {
                    String name = parts[0].trim();
                    String url = parts[1].trim();
                    map.put(name, url);
                }
            }
        }
    }
    return map;
}

    @Override
    public ResponseEntity<String> getPerformanceStyles(Optional<Integer> page, Optional<Integer> perPage) {
        try {
            HttpHeaders headers = createRequestHeaders();

            String url = UriComponentsBuilder
                    .fromHttpUrl("https://lahajati.ai/api/v1/performance-absolute-control")
                    .queryParamIfPresent("page", page)
                    .queryParamIfPresent("per_page", perPage)
                    .toUriString();

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            return ResponseEntity.status(response.getStatusCode())
                    .headers(createCleanHeaders())
                    .body(response.getBody());
        } catch (Exception e) {
            log.error("Error getting performance styles: ", e);
            throw e;
        }
    }

    @Override
    public ResponseEntity<String> getDialects(Optional<Integer> page, Optional<Integer> perPage) {
        try {
            HttpHeaders headers = createRequestHeaders();

            String url = UriComponentsBuilder
                    .fromHttpUrl("https://lahajati.ai/api/v1/dialect-absolute-control")
                    .queryParamIfPresent("page", page)
                    .queryParamIfPresent("per_page", perPage)
                    .toUriString();

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            return ResponseEntity.status(response.getStatusCode())
                    .headers(createCleanHeaders())
                    .body(response.getBody());
        } catch (Exception e) {
            log.error("Error getting dialects: ", e);
            throw e;
        }
    }

    @Override
    public ResponseEntity<byte[]> textToSpeechPro(Map<String, Object> requestBody) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(MediaType.parseMediaTypes("audio/mpeg"));
            headers.setBearerAuth(apiKey);
            headers.set("Connection", "close"); // Add this

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String url = "https://lahajati.ai/api/v1/text-to-speech-pro";
            ResponseEntity<byte[]> response = restTemplate.exchange(url, HttpMethod.POST, entity, byte[].class);
        
            // Create clean headers for the response
            HttpHeaders cleanHeaders = new HttpHeaders();
            cleanHeaders.setContentType(MediaType.valueOf("audio/mpeg"));
            cleanHeaders.remove("Transfer-Encoding");
        
            return ResponseEntity.status(response.getStatusCode())
                .headers(cleanHeaders)
                .body(response.getBody());
        } catch (Exception e) {
            log.error("Error with text to speech pro: ", e);
            throw e;
        }
    }

    @Override
    public ResponseEntity<byte[]> speechToSpeechPro(MultipartFile audioFile, String idVoice, boolean professionalQuality) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey);
            headers.setAccept(MediaType.parseMediaTypes("audio/mpeg"));
            headers.set("Connection", "close"); // Add this

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            Resource fileResource = new MultipartInputStreamFileResource(audioFile);
            body.add("audio_file", fileResource);
            body.add("id_voice", idVoice);
            body.add("professional_quality", professionalQuality ? "1" : "0");

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<byte[]> response = restTemplate.exchange(stsUrl, HttpMethod.POST, requestEntity, byte[].class);
        
            // Create clean headers for the response
            HttpHeaders cleanHeaders = new HttpHeaders();
            cleanHeaders.setContentType(MediaType.valueOf("audio/mpeg"));
            cleanHeaders.remove("Transfer-Encoding");
        
            return ResponseEntity.status(response.getStatusCode())
                .headers(cleanHeaders)
                .body(response.getBody());
        } catch (IOException e) {
            log.error("Error processing audio file: ", e);
            throw new RuntimeException("Failed to read audio file", e);
        } catch (Exception e) {
            log.error("Error with speech to speech pro: ", e);
            throw e;
        }
    }

    @Override
    public ResponseEntity<String> getGeneralVoices(Optional<Integer> page, Optional<Integer> perPage, Optional<String> gender) {
        try {
            HttpHeaders headers = createRequestHeaders();

            String url = UriComponentsBuilder
                    .fromHttpUrl("https://lahajati.ai/api/v1/voices")
                    .queryParamIfPresent("page", page)
                    .queryParamIfPresent("per_page", perPage)
                    .queryParamIfPresent("gender", gender)
                    .toUriString();

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            return ResponseEntity.status(response.getStatusCode())
                    .headers(createCleanHeaders())
                    .body(response.getBody());
        } catch (Exception e) {
            log.error("Error getting general voices: ", e);
            throw e;
        }
    }

    @Override
    public ResponseEntity<String> createClonedVoice(String voiceName, String gender, MultipartFile voiceImage, MultipartFile audioFile, String voiceTags) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey);
            headers.setAccept(MediaType.parseMediaTypes("application/json"));

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("voice_name", voiceName);
            body.add("gender", gender);
            body.add("voice_tags", voiceTags);
            body.add("voice_image", new MultipartInputStreamFileResource(voiceImage));
            body.add("audio_file", new MultipartInputStreamFileResource(audioFile));

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            String url = "https://lahajati.ai/api/v1/voices/cloned";
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);
            
            return ResponseEntity.status(response.getStatusCode())
                    .headers(createCleanHeaders())
                    .body(response.getBody());
        } catch (IOException e) {
            log.error("Error processing uploaded files: ", e);
            throw new RuntimeException("Failed to process uploaded files", e);
        } catch (Exception e) {
            log.error("Error creating cloned voice: ", e);
            throw e;
        }
    }

    @Override
    public ResponseEntity<String> updateClonedVoice(String voiceId, Map<String, Object> requestBody) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(MediaType.parseMediaTypes("application/json"));
            headers.set("Connection", "close");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String url = "https://lahajati.ai/api/v1/voices/cloned/" + voiceId;
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
            
            return ResponseEntity.status(response.getStatusCode())
                    .headers(createCleanHeaders())
                    .body(response.getBody());
        } catch (Exception e) {
            log.error("Error updating cloned voice: ", e);
            throw e;
        }
    }

    @Override
    public ResponseEntity<String> deleteClonedVoice(String voiceId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey);
            headers.setAccept(MediaType.parseMediaTypes("application/json"));
            headers.set("Connection", "close");

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            String url = "https://lahajati.ai/api/v1/voices/cloned/" + voiceId;
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);
            
            return ResponseEntity.status(response.getStatusCode())
                    .headers(createCleanHeaders())
                    .body(response.getBody());
        } catch (Exception e) {
            log.error("Error deleting cloned voice: ", e);
            throw e;
        }
    }
}
