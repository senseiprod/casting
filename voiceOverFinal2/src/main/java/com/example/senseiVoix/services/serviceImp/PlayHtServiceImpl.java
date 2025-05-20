package com.example.senseiVoix.services.serviceImp;


import com.example.senseiVoix.dtos.voix.VoixResponsePH;
import com.example.senseiVoix.services.PlayHtService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import okhttp3.MediaType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;

import org.springframework.stereotype.Service;

import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Nullable;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
public class PlayHtServiceImpl implements PlayHtService {

    private static final String API_URL = "https://api.play.ht/api/v2/cloned-voices/instant";
    private static final String API_KEY = "cd811ce3ac8f4fdf95c6987e1354a15d";
    private static final String X_USER_ID = "XeBigECFu7MRUUW3az50d31GX3k1";// Replace with your actual API key
    private final RestTemplate restTemplate;


    // Inject RestTemplate using constructor injection
    @Autowired
    public PlayHtServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }


    /**
     * Service method to synthesize speech using the PlayHT API
     * Only text and voice are required, all other parameters are optional
     */
    @Override
    public byte[] synthesizeSpeech(String text, String voice, String language) {
        return synthesizeSpeech(text, voice,language, null, null, null, null, null, null,
                null, null, null, null, null);
    }

    /**
     * Full service method with all possible parameters for PlayHT API
     */
    @Override
    public byte[] synthesizeSpeech(
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

    ) {

        // Create HttpHeaders to set the content type and authorization details
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + API_KEY);
        headers.set("X-User-Id", X_USER_ID);

        // Create a map for the request body with required parameters
        Map<String, Object> body = new HashMap<>();
        body.put("text", text);
        body.put("voice", voice);
        body.put("language", language);
        body.put("voice_engine", "Play3.0-mini");


        // Add optional parameters if they are provided
        if (quality != null) body.put("quality", quality);
        if (outputFormat != null) body.put("output_format", outputFormat);
        if (speed != null) body.put("speed", speed);
        if (sampleRate != null) body.put("sample_rate", sampleRate);
        if (seed != null) body.put("seed", seed);
        if (temperature != null) body.put("temperature", temperature);
        //if (voiceEngine != null) body.put("voice_engine", voiceEngine);
        if (emotion != null) body.put("emotion", emotion);
        if (voiceGuidance != null) body.put("voice_guidance", voiceGuidance);
        if (styleGuidance != null) body.put("style_guidance", styleGuidance);
        if (textGuidance != null) body.put("text_guidance", textGuidance);



        // Create an HttpEntity with the headers and body
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        // Make the POST request using RestTemplate
        ResponseEntity<byte[]> response = restTemplate.exchange(
                "https://api.play.ht/api/v2/tts/stream",
                HttpMethod.POST,
                request,
                byte[].class // Expecting binary data (audio file)
        );

        // Handle the response
        if (response.getStatusCode() == HttpStatus.OK) {
            return response.getBody(); // Return the MP3 byte array
        } else {
            throw new RuntimeException("Error generating audio: " + response.getStatusCode());
        }
    }








    @Override
    public List<Map<String, Object>> getClonedVoices() throws IOException {
        OkHttpClient client = new OkHttpClient();

        Request request = new Request.Builder()
                .url("https://api.play.ht/api/v2/cloned-voices")
                .get()
                .addHeader("accept", "audio/mp3")
                .addHeader( "content-type", "application/json")
                .addHeader("Authorization", "Bearer " + API_KEY)
                .addHeader("X-User-Id", X_USER_ID)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected code " + response);
            }

            // Convert JSON response to List<Map<String, Object>>
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(response.body().string(), new TypeReference<List<Map<String, Object>>>() {});
        }
    }


    @Override
    public List<Map<String, Object>> getVoices() throws IOException {
        OkHttpClient client = new OkHttpClient();

        // Send GET request to the voices API endpoint
        Request request = new Request.Builder()
                .url("https://api.play.ht/api/v2/voices")  // Make sure this URL is correct
                .get()
                .addHeader("accept", "application/json")
                .addHeader("Authorization", "Bearer " + API_KEY)
                .addHeader("X-User-Id", X_USER_ID)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected code " + response);
            }

            // Parse JSON response into a List<Map<String, Object>>
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(response.body().string(), new TypeReference<List<Map<String, Object>>>() {});
        }
    }



    @Override
    public VoixResponsePH cloneVoiceFromFile(MultipartFile file, String voiceName) throws IOException {
        OkHttpClient client = new OkHttpClient();

        // Prepare the multipart form-data request
        MultipartBody.Builder builder = new MultipartBody.Builder().setType(MultipartBody.FORM);
        builder.addFormDataPart("sample_file", file.getOriginalFilename(),
                RequestBody.create(file.getBytes(), MediaType.get("audio/wav")));

        // Adjust the media type if needed
        builder.addFormDataPart("voice_name", voiceName);

        RequestBody requestBody = builder.build();

        Request request = new Request.Builder()
                .url("https://api.play.ht/api/v2/cloned-voices/instant")
                .post(requestBody)
                .addHeader("accept", "application/json")
                .addHeader("Authorization", "Bearer " + API_KEY)
                .addHeader("X-User-Id", X_USER_ID)
                .build();

        // Make the API call
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected code " + response);
            }

            // Handle the response, assuming it's a JSON string (you can adjust this based on the API's response format)
            String responseBody = response.body().string();
            responseBody = responseBody.substring(1, responseBody.length() - 1); // Removing { and }
            String[] keyValuePairs = responseBody.split(",");

            // Create an object to hold the parsed data
            VoixResponsePH voiceData = new VoixResponsePH();

            // Iterate through key-value pairs and populate the object
            for (String pair : keyValuePairs) {
                // Traitement spécifique de l'ID pour ne pas couper à cause des deux-points
                String key = pair.substring(0, pair.indexOf(":")).trim().replace("\"", "");
                String value = pair.substring(pair.indexOf(":") + 1).trim().replace("\"", "");

                System.out.println("key: " + key + " value: " + value);

                // Set values based on key
                if (key.equals("id")) {
                    // Si l'ID commence par "s3://", on le garde tel quel
                    if (value.startsWith("s3://")) {
                        voiceData.setId(value);  // Conserver toute l'URL après s3://
                    } else {
                        voiceData.setId(value);
                    }
                } else if (key.equals("name")) {
                    voiceData.setName(value);
                } else if (key.equals("type")) {
                    voiceData.setType(value);
                } else if (key.equals("voice_engine")) {
                    voiceData.setVoiceEngine(value);
                }
            }

            return voiceData;
        }


    }



    @Override
    public String cloneVoiceFromUrl(String fileUrl, String voiceName) throws IOException {
        OkHttpClient client = new OkHttpClient();

        // Construct the multipart form request
        MultipartBody requestBody = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("sample_file_url", fileUrl) // URL of the audio file
                .addFormDataPart("voice_name", voiceName) // Name of the cloned voice
                .build();

        // Create the request
        Request request = new Request.Builder()
                .url("https://api.play.ht/api/v2/cloned-voices/instant/") // API endpoint
                .post(requestBody)
                .addHeader("accept", "application/json")
                .addHeader("Authorization", "Bearer " + API_KEY) // Authentication
                .addHeader("X-User-Id", X_USER_ID) // User ID
                .build();

        // Execute the request and handle the response
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to clone voice from URL: " + response.body().string());
            }

            return response.body().string();
        }
    }


    @Override
    public String deleteClonedVoice(String voiceId) {
        OkHttpClient client = new OkHttpClient();

        MediaType mediaType = MediaType.parse("application/json");
        RequestBody body = RequestBody.create(mediaType, "{\"voice_id\":\"" + voiceId + "\"}"); // Send voiceId in JSON body

        Request request = new Request.Builder()
                .url("https://api.play.ht/api/v2/cloned-voices/") // No voiceId in URL
                .delete(body) // Pass body in DELETE request
                .addHeader("accept", "application/json")
                .addHeader("content-type", "application/json")
                .addHeader("Authorization", "Bearer " + API_KEY)
                .addHeader("X-User-Id", X_USER_ID)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("Failed to delete cloned voice: " + response.body().string());
            }

            return response.body().string();
        } catch (IOException e) {
            throw new RuntimeException("Error while deleting cloned voice", e);
        }
    }


}
