package com.example.senseiVoix.dtos.action;

import com.example.senseiVoix.enumeration.StatutAction;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
public class ActionResponse {
    String uuid;
    String code;

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public StatutAction getStatutAction() {
        return statutAction;
    }

    public void setStatutAction(StatutAction statutAction) {
        this.statutAction = statutAction;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getVoiceUuid() {
        return voiceUuid;
    }

    public void setVoiceUuid(String voiceUuid) {
        this.voiceUuid = voiceUuid;
    }

    public Date getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(Date dateCreation) {
        this.dateCreation = dateCreation;
    }

    public String getUtilisateurUuid() {
        return utilisateurUuid;
    }

    public void setUtilisateurUuid(String utilisateurUuid) {
        this.utilisateurUuid = utilisateurUuid;
    }

    String text;
    StatutAction statutAction;
    String language;
    String voiceUuid;
    Date dateCreation;
    String utilisateurUuid;
}
