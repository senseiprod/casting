package com.example.senseiVoix.dtos.audio;

import com.example.senseiVoix.enumeration.TypeAudio;
import lombok.Data;

@Data
public class AudioResponse {
    public TypeAudio getTypeAudio() {
        return typeAudio;
    }

    public void setTypeAudio(TypeAudio typeAudio) {
        this.typeAudio = typeAudio;
    }

    private Long id;
    private String speakerUuid;
    private TypeAudio typeAudio;

    public String getSpeakerUuid() {
        return speakerUuid;
    }

    public AudioResponse(Long id, String speakerUuid, String format, byte[] audioFile, TypeAudio typeAudio) {
        this.id = id;
        this.speakerUuid = speakerUuid;
        this.format = format;
        this.audioFile = audioFile;
        this.typeAudio = typeAudio;
    }

    public void setSpeakerUuid(String speakerUuid) {
        this.speakerUuid = speakerUuid;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public byte[] getAudioFile() {
        return audioFile;
    }

    public void setAudioFile(byte[] audioFile) {
        this.audioFile = audioFile;
    }

    private String format;
    private byte[] audioFile;







}
