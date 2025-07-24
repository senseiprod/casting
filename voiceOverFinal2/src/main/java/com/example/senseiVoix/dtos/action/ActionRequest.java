package com.example.senseiVoix.dtos.action;

import com.example.senseiVoix.enumeration.ActionAccessType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * DTO for {@link com.example.senseiVoix.entities.Action}
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActionRequest implements Serializable {
    String text;
    String voiceUuid;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }


    public String getVoiceUuid() {
        return voiceUuid;
    }

    public void setVoiceUuid(String voiceUuid) {
        this.voiceUuid = voiceUuid;
    }

    public String getUtilisateurUuid() {
        return utilisateurUuid;
    }

    public void setUtilisateurUuid(String utilisateurUuid) {
        this.utilisateurUuid = utilisateurUuid;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    String utilisateurUuid;
    String language;
    private String projectUuid;
    private byte[] audioGenerated;
    ActionAccessType actionAccessType;

    public ActionAccessType getActionAccessType() {
        return actionAccessType;
    }

    public void setActionAccessType(ActionAccessType actionAccessType) {
        this.actionAccessType = actionAccessType;
    }


    public String getProjectUuid() {
        return projectUuid;
    }

    public void setProjectUuid(String projectUuid) {
        this.projectUuid = projectUuid;
    }

    public byte[] getAudioGenerated() {
        return audioGenerated;
    }

    public void setAudioGenerated(byte[] audioGenerated) {
        this.audioGenerated = audioGenerated;
    }
}
