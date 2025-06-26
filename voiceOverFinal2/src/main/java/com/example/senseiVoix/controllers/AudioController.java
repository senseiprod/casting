package com.example.senseiVoix.controllers;

import com.example.senseiVoix.dtos.audio.AudioRequest;
import com.example.senseiVoix.dtos.audio.AudioResponse;
import com.example.senseiVoix.dtos.audio.ResponseAudio;
import com.example.senseiVoix.entities.Audio;
import com.example.senseiVoix.enumeration.TypeAudio;
import com.example.senseiVoix.exceptions.ResourceNotFoundException;
import com.example.senseiVoix.repositories.AudioRepository;
import com.example.senseiVoix.services.AudioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/audios")
public class AudioController {

    private final AudioService audioService;
    private final AudioRepository audioRepository;

    @Autowired
    public AudioController(AudioService audioService, AudioRepository audioRepository) {
        this.audioService = audioService;
        this.audioRepository = audioRepository;
    }


    @GetMapping("/all")
    public ResponseEntity<List<AudioResponse>> getAllAudios() {
        List<AudioResponse> audioResponses = audioService.getAllAudios();

        // Convert byte[] audioFile to base64-encoded string for each AudioResponse
        for (AudioResponse response : audioResponses) {
            String base64Audio = Base64.getEncoder().encodeToString(response.getAudioFile());
            // Add a base64 string field to AudioResponse
        }

        // Prepare the response
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Return the list of audio files with base64 data included
        return new ResponseEntity<>(audioResponses, headers, HttpStatus.OK);
    }


    @PostMapping
    public ResponseEntity<AudioResponse> createAudio(
            @RequestParam("speakerId") String speakerId,
            @RequestParam("audioFile") MultipartFile audioFile,
            @RequestParam("format") String format,
            @RequestParam("type")TypeAudio typeAudio

            ) {

        AudioRequest audioRequest = new AudioRequest();
        audioRequest.setSpeakerUuid(speakerId);
        audioRequest.setAudioFile(audioFile);
        audioRequest.setFormat(audioFile.getContentType());
        audioRequest.setTypeAudio(typeAudio);

        AudioResponse audioResponse = audioService.createAudio(audioRequest);
        return ResponseEntity.ok(audioResponse);
    }





    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadAudio(@PathVariable Long id) {
        AudioResponse audioResponse = audioService.getAudioById(id);


        Audio audio = audioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Audio not found"));

        byte[] audioData = audio.getAudioFile();
        String fileName = "audio_" + id + "." + audio.getFormat();


        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=" + fileName)
                .contentType(MediaType.parseMediaType("audio/" + audio.getFormat()))
                .body(audioData);
    }



    @GetMapping("/speaker/{speakerId}")
    public ResponseEntity<List<ResponseAudio>> getAllAudiosBySpeaker(@PathVariable String speakerId) {
        List<ResponseAudio> audioResponses = audioService.getAllAudiosBySpeaker(speakerId);
        return ResponseEntity.ok().body(audioResponses);
    }



    @PutMapping("/{id}")
    public ResponseEntity<AudioResponse> updateAudio(@PathVariable Long id, @RequestBody AudioRequest audioRequest) {
        AudioResponse updatedAudio = audioService.updateAudio(id, audioRequest);
        return ResponseEntity.ok(updatedAudio);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAudio(@PathVariable Long id) {
        audioService.deleteAudio(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/audio/{audioId}")
    public ResponseEntity<byte[]> getAudioFile(@PathVariable Long audioId) {
        // Fetch the Audio object from the repository
        Audio audio = audioRepository.findById(audioId)
                .orElseThrow(() -> new ResourceNotFoundException("Audio not found with id " + audioId));

        // Get the raw byte array of the audio file
        byte[] audioFile = audio.getAudioFile();

        // Prepare headers to indicate content type
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("audio/" + audio.getFormat()));
        headers.setContentDispositionFormData("attachment", audioId + "." + audio.getFormat());

        // Return the audio file as byte array
        return new ResponseEntity<>(audioFile, headers, HttpStatus.OK);
    }

}
