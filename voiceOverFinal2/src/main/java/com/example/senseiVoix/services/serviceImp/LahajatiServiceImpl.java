package com.example.senseiVoix.services.serviceImp;


import com.example.senseiVoix.helpers.MultipartInputStreamFileResource;
import com.example.senseiVoix.services.LahajatiService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LahajatiServiceImpl implements LahajatiService {


    @Value("${lahajati.api.key}")
    private String apiKey;

    @Value("${lahajati.tts.url}")
    private String ttsUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private final String stsUrl = "https://lahajati.ai/api/v1/speech-to-speech-pro";

    @Override
    public ResponseEntity<byte[]> generateSpeech(Map<String, Object> requestBody) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(MediaType.parseMediaTypes("audio/mpeg"));
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        

        ResponseEntity<byte[]> response =  restTemplate.exchange(ttsUrl, HttpMethod.POST, entity, byte[].class);
                // Copy headers except CORS ones
                HttpHeaders filteredHeaders = new HttpHeaders();
                response.getHeaders().forEach((key, values) -> {
                    if (!key.equalsIgnoreCase("Access-Control-Allow-Origin") &&
                        !key.equalsIgnoreCase("Access-Control-Allow-Credentials")) {
                        filteredHeaders.put(key, values);
                    }
                });
        
        // Return response with filtered headers
        return new ResponseEntity<>(response.getBody(), filteredHeaders, response.getStatusCode());
    }
    @Override
    public ResponseEntity<String> getVoices(Optional<Integer> page, Optional<Integer> perPage, Optional<String> gender) {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(MediaType.parseMediaTypes("application/json"));
        headers.setBearerAuth(apiKey);
        

        String url = UriComponentsBuilder
                .fromHttpUrl("https://lahajati.ai/api/v1/voices-absolute-control")
                .queryParamIfPresent("page", page)
                .queryParamIfPresent("per_page", perPage)
                .queryParamIfPresent("gender", gender)
                .toUriString();

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

        // Copy headers except CORS ones
        HttpHeaders filteredHeaders = new HttpHeaders();
        response.getHeaders().forEach((key, values) -> {
            if (!key.equalsIgnoreCase("Access-Control-Allow-Origin") &&
                !key.equalsIgnoreCase("Access-Control-Allow-Credentials")) {
                filteredHeaders.put(key, values);
            }
        });

// Return response with filtered headers
return new ResponseEntity<>(response.getBody(), filteredHeaders, response.getStatusCode());

    }

    @Override
    public ResponseEntity<String> getPerformanceStyles(Optional<Integer> page, Optional<Integer> perPage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(MediaType.parseMediaTypes("application/json"));
        headers.setBearerAuth(apiKey);

        String url = UriComponentsBuilder
                .fromHttpUrl("https://lahajati.ai/api/v1/performance-absolute-control")
                .queryParamIfPresent("page", page)
                .queryParamIfPresent("per_page", perPage)
                .toUriString();

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

        // Copy headers except CORS ones
        HttpHeaders filteredHeaders = new HttpHeaders();
        response.getHeaders().forEach((key, values) -> {
            if (!key.equalsIgnoreCase("Access-Control-Allow-Origin") &&
                !key.equalsIgnoreCase("Access-Control-Allow-Credentials")) {
                filteredHeaders.put(key, values);
            }
        });

// Return response with filtered headers
return new ResponseEntity<>(response.getBody(), filteredHeaders, response.getStatusCode());

    }


    @Override
    public ResponseEntity<String> getDialects(Optional<Integer> page, Optional<Integer> perPage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(MediaType.parseMediaTypes("application/json"));
        headers.setBearerAuth(apiKey);

        String url = UriComponentsBuilder
                .fromHttpUrl("https://lahajati.ai/api/v1/dialect-absolute-control")
                .queryParamIfPresent("page", page)
                .queryParamIfPresent("per_page", perPage)
                .toUriString();

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

        // Copy headers except CORS ones
        HttpHeaders filteredHeaders = new HttpHeaders();
        response.getHeaders().forEach((key, values) -> {
            if (!key.equalsIgnoreCase("Access-Control-Allow-Origin") &&
                !key.equalsIgnoreCase("Access-Control-Allow-Credentials")) {
                filteredHeaders.put(key, values);
            }
        });

// Return response with filtered headers
return new ResponseEntity<>(response.getBody(), filteredHeaders, response.getStatusCode());
    }



    @Override
    public ResponseEntity<byte[]> textToSpeechPro(Map<String, Object> requestBody) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(MediaType.parseMediaTypes("audio/mpeg"));
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String url = "https://lahajati.ai/api/v1/text-to-speech-pro";

        ResponseEntity<byte[]> response = restTemplate.exchange(url, HttpMethod.POST, entity, byte[].class);

        // Copy headers except CORS ones
        HttpHeaders filteredHeaders = new HttpHeaders();
        response.getHeaders().forEach((key, values) -> {
            if (!key.equalsIgnoreCase("Access-Control-Allow-Origin") &&
                !key.equalsIgnoreCase("Access-Control-Allow-Credentials")) {
                filteredHeaders.put(key, values);
            }
        });

        return new ResponseEntity<>(response.getBody(), filteredHeaders, response.getStatusCode());    }


    @Override
    public ResponseEntity<byte[]> speechToSpeechPro(MultipartFile audioFile, String idVoice, boolean professionalQuality) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setAccept(MediaType.parseMediaTypes("audio/mpeg"));
        // Don't set Content-Type explicitly for multipart

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        try {
            Resource fileResource = new MultipartInputStreamFileResource(audioFile);
            body.add("audio_file", fileResource);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read audio file", e);
        }
        body.add("id_voice", idVoice);
        body.add("professional_quality", professionalQuality ? "1" : "0");

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        return restTemplate.exchange(stsUrl, HttpMethod.POST, requestEntity, byte[].class);
    }

    @Override
    public ResponseEntity<String> getGeneralVoices(Optional<Integer> page, Optional<Integer> perPage, Optional<String> gender) {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(MediaType.parseMediaTypes("application/json"));
        headers.setBearerAuth(apiKey);

        String url = UriComponentsBuilder
                .fromHttpUrl("https://lahajati.ai/api/v1/voices")
                .queryParamIfPresent("page", page)
                .queryParamIfPresent("per_page", perPage)
                .queryParamIfPresent("gender", gender)
                .toUriString();

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        return restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
    }


    @Override
    public ResponseEntity<String> createClonedVoice(String voiceName, String gender, MultipartFile voiceImage, MultipartFile audioFile, String voiceTags) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setAccept(MediaType.parseMediaTypes("application/json"));

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        try {
            body.add("voice_name", voiceName);
            body.add("gender", gender);
            body.add("voice_tags", voiceTags);
            body.add("voice_image", new MultipartInputStreamFileResource(voiceImage));
            body.add("audio_file", new MultipartInputStreamFileResource(audioFile));
        } catch (IOException e) {
            throw new RuntimeException("Failed to process uploaded files", e);
        }

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        String url = "https://lahajati.ai/api/v1/voices/cloned";

        return restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);
    }

    @Override
    public ResponseEntity<String> updateClonedVoice(String voiceId, Map<String, Object> requestBody) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(MediaType.parseMediaTypes("application/json"));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String url = "https://lahajati.ai/api/v1/voices/cloned/" + voiceId;

        return restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
    }

    @Override
    public ResponseEntity<String> deleteClonedVoice(String voiceId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setAccept(MediaType.parseMediaTypes("application/json"));

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        String url = "https://lahajati.ai/api/v1/voices/cloned/" + voiceId;

        return restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);
    }



}
