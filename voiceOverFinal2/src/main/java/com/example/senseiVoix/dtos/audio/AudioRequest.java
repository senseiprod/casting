package com.example.senseiVoix.dtos.audio;

import com.example.senseiVoix.enumeration.TypeAudio;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AudioRequest {
    private String speakerUuid;


    public String getSpeakerUuid() {
        return speakerUuid;
    }

    public void setSpeakerUuid(String speakerUuid) {
        this.speakerUuid = speakerUuid;
    }

    public MultipartFile getAudioFile() {
        return audioFile;
    }

    public void setAudioFile(MultipartFile audioFile) {
        this.audioFile = audioFile;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    private MultipartFile audioFile;
    private String format;
    private TypeAudio typeAudio;

    public TypeAudio getTypeAudio() {
        return typeAudio;
    }

    public void setTypeAudio(TypeAudio typeAudio) {
        this.typeAudio = typeAudio;
    }
}
