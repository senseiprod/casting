package com.example.senseiVoix.controllers;
import com.example.senseiVoix.dtos.voix.VoixResponsePH;
import com.example.senseiVoix.services.serviceImp.PlayHtServiceImpl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/playht")
@CrossOrigin("*")
public class PlayHtController {

    private final PlayHtServiceImpl playHtService;

    public PlayHtController(PlayHtServiceImpl playHtService) {
        this.playHtService = playHtService;
    }

    @PostMapping("/synthesize")
    public ResponseEntity<byte[]> synthesize(
            @RequestParam("text") String text,
            @RequestParam("voice") String voice,
            @RequestParam(value = "language") String language
    ) {

        byte[] audioData = playHtService.synthesizeSpeech(text, voice, language);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "audio/mp3")
                .body(audioData);
    }

    // Optional: You can also keep the full endpoint with all parameters
    @PostMapping("/synthesize/advanced")
    public ResponseEntity<byte[]> synthesizeAdvanced(
            @RequestParam("text") String text,
            @RequestParam("voice") String voice,
            @RequestParam("language") String language,
            @RequestParam(value = "quality", required = false) String quality,
            @RequestParam(value = "output_format", required = false) String outputFormat,
            @RequestParam(value = "speed", required = false) Float speed,
            @RequestParam(value = "sample_rate", required = false) Integer sampleRate,
            @RequestParam(value = "seed", required = false) Integer seed,
            @RequestParam(value = "temperature", required = false) Float temperature,
            @RequestParam(value = "voice_engine", required = false) String voiceEngine,
            @RequestParam(value = "emotion", required = false) String emotion,
            @RequestParam(value = "voice_guidance", required = false) Integer voiceGuidance,
            @RequestParam(value = "style_guidance", required = false) Integer styleGuidance,
            @RequestParam(value = "text_guidance", required = false) Float textGuidance)





    {

        byte[] audioData = playHtService.synthesizeSpeech(
                text, voice, language, quality, outputFormat, speed, sampleRate, seed, temperature,
                voiceEngine, emotion, voiceGuidance, styleGuidance, textGuidance);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "audio/mp3")
                .body(audioData);
    }





    @GetMapping("/cloned-voices")
    public List<Map<String, Object>> getClonedVoices() throws IOException {
        return playHtService.getClonedVoices();
    }

    @GetMapping("/voices")
    public List<Map<String, Object>> getVoices() throws IOException {
        return playHtService.getVoices();
    }

    /**
     * 1 Endpoint pour envoyer un fichier audio
     */
    @PostMapping("/clone-voice-from-file")
    public ResponseEntity<VoixResponsePH> cloneVoiceFromFile(@RequestParam("file") MultipartFile file,
                                                     @RequestParam("voiceName") String voiceName) throws IOException {

            VoixResponsePH response = playHtService.cloneVoiceFromFile(file, voiceName);
            return new ResponseEntity<>(response, HttpStatus.OK);

    }

    /**
     * 2 Endpoint pour envoyer un lien d'un fichier audio
     */
    @PostMapping("/clone-voice/url")
    public String cloneVoiceFromUrl(@RequestParam("file_url") String fileUrl, @RequestParam("voice_name") String voiceName) throws IOException {
        return playHtService.cloneVoiceFromUrl(fileUrl, voiceName);
    }

    @DeleteMapping("/clone-voice/{voice_id}")
    public String deleteClonedVoice(@PathVariable String voice_id) {
        return playHtService.deleteClonedVoice(voice_id);
    }


}
