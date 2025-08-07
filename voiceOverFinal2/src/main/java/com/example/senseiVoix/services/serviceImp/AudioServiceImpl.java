package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.audio.AudioRequest;
import com.example.senseiVoix.dtos.audio.AudioResponse;
import com.example.senseiVoix.dtos.audio.ResponseAudio;
import com.example.senseiVoix.entities.Audio;
import com.example.senseiVoix.entities.Speaker;
import com.example.senseiVoix.enumeration.TypeAudio;
import com.example.senseiVoix.repositories.AudioRepository;
import com.example.senseiVoix.repositories.SpeakerRepository;
import com.example.senseiVoix.services.AudioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;
import javax.sql.DataSource;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service

public class AudioServiceImpl implements AudioService {

    @Autowired
    public AudioServiceImpl(AudioRepository audioRepository, SpeakerRepository speakerRepository, DataSource dataSource) {
        this.audioRepository = audioRepository;
        this.speakerRepository = speakerRepository;

    }

    public List<AudioResponse> getAllAudios() {
        List<Audio> audios = audioRepository.findAll();

        // Map the list of Audio objects to AudioResponse objects
        return audios.stream()
                .map(audio -> {
                    // Assuming audio.getAudioFile() returns a byte[] of the audio file
                    byte[] audioFile = audio.getAudioFile();
                    String base64Audio = Base64.getEncoder().encodeToString(audio.getAudioFile());

                    // Create a new AudioResponse, passing the byte array
                    return new AudioResponse(
                            audio.getId(),
                            audio.getSpeaker().getUuid(),
                            audio.getFormat(),
                            audioFile,
                            audio.getTypeAudio()
                    );
                })
                .collect(Collectors.toList());
    }

    @Override
    public AudioResponse createAudio(AudioRequest audioRequest) {
        Speaker speaker = speakerRepository.findByUuid(audioRequest.getSpeakerUuid())
        ;

        try {
            MultipartFile file = audioRequest.getAudioFile();
            byte[] audioData = file.getBytes();
            System.out.println("Audio Data Length: " + audioData.length);
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());


            Audio audio = new Audio();
            audio.setSpeaker(speaker);
            audio.setAudioFile(audioData);
            audio.setFormat(audioRequest.getFormat());
            audio.setTypeAudio(audioRequest.getTypeAudio());
            String base64Audio = Base64.getEncoder().encodeToString(audio.getAudioFile());

            audioRepository.save(audio);
            return new AudioResponse(audio.getId(), speaker.getUuid(), audio.getFormat(),audio.getAudioFile(), audio.getTypeAudio());
        } catch (IOException e) {
            throw new RuntimeException("Error processing file", e);
        }
    }


    @Override
    public List<ResponseAudio> getAllAudiosBySpeaker(String speakerId) {
        List<Audio> audios = audioRepository.findBySpeakerId(speakerId);
        return audios.stream()
                .map(audio -> new ResponseAudio(audio.getAudioFile(), audio.getTypeAudio()))
                .collect(Collectors.toList());
    }



    @Override
    public AudioResponse updateAudio(Long id, AudioRequest audioRequest) {
        Audio audio = audioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Audio not found"));

        Speaker speaker = speakerRepository.findByUuid(audioRequest.getSpeakerUuid());

        try {
            audio.setSpeaker(speaker);
            audio.setAudioFile(audioRequest.getAudioFile().getBytes());
            audio.setFormat(audioRequest.getFormat());
            String base64Audio = Base64.getEncoder().encodeToString(audio.getAudioFile());

            audioRepository.save(audio);
            return new AudioResponse(audio.getId(),audio.getSpeaker().getUuid(), audio.getFormat(),audio.getAudioFile(), audio.getTypeAudio());
        } catch (IOException e) {
            throw new RuntimeException("Error updating audio file", e);
        }
    }

    @Override
    public void deleteAudio(Long id) {
        audioRepository.deleteById(id);
    }


 @Autowired
    private AudioRepository audioRepository;

    @Autowired
    private SpeakerRepository speakerRepository;

    @Override
    public List<AudioResponse> getAudiosBySpeaker(String speakerUuid) {
        Speaker speaker = speakerRepository.findByUuid(speakerUuid);
        if (speaker == null || speaker.getAudios() == null) {
            return List.of();
        }
        
        return speaker.getAudios().stream()
                .map(this::mapToAudioResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AudioResponse> getAudiosByType(TypeAudio typeAudio) {
        List<Audio> audios = audioRepository.findByTypeAudio(typeAudio);
        return audios.stream()
                .map(this::mapToAudioResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AudioResponse> getAudiosBySpeakerAndType(String speakerUuid, TypeAudio typeAudio) {
        Speaker speaker = speakerRepository.findByUuid(speakerUuid);
        if (speaker == null || speaker.getAudios() == null) {
            return List.of();
        }
        
        return speaker.getAudios().stream()
                .filter(audio -> audio.getTypeAudio() == typeAudio)
                .map(this::mapToAudioResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AudioResponse getAudioById(Long id) {
        Audio audio = audioRepository.findById(id).orElse(null);
        if (audio == null ) {
            return null;
        }
        return mapToAudioResponse(audio);
    }

    @Override
    public Long getTotalAudioSizeBySpeaker(String speakerUuid) {
        Speaker speaker = speakerRepository.findByUuid(speakerUuid);
        if (speaker == null || speaker.getAudios() == null) {
            return 0L;
        }
        
        return speaker.getAudios().stream()
                .filter(audio -> audio.getAudioFile() != null)
                .mapToLong(audio -> audio.getAudioFile().length)
                .sum();
    }

    @Override
    public Integer getAudioCountBySpeaker(String speakerUuid) {
        Speaker speaker = speakerRepository.findByUuid(speakerUuid);
        if (speaker == null || speaker.getAudios() == null) {
            return 0;
        }
        
        return (int) speaker.getAudios().stream()
                
                .count();
    }

    private AudioResponse mapToAudioResponse(Audio audio) {
        AudioResponse response = new AudioResponse();
        response.setId(audio.getId());
        response.setFormat(audio.getFormat());
        response.setTypeAudio(audio.getTypeAudio());
        
        // Speaker information
        if (audio.getSpeaker() != null) {
            response.setSpeakerUuid(audio.getSpeaker().getUuid());
            response.setSpeakerName(audio.getSpeaker().getPrenom() + " " + audio.getSpeaker().getNom());
        }
        
        
        // Audio file information
        response.setHasAudioFile(audio.getAudioFile() != null && audio.getAudioFile().length > 0);
        if (audio.getAudioFile() != null) {
            response.setFileSizeInBytes((long) audio.getAudioFile().length);
            response.setFileSizeFormatted(formatFileSize(audio.getAudioFile().length));
        }
        
        return response;
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }


}
