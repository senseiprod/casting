package com.example.senseiVoix.dtos.action;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public class ActionDarija {

    private String text;
    private String voiceUuid;
    private String utilisateurUuid;
    private String language;
    private String projectUuid;

    // Champs optionnels pour la langue "darija"
    private String dialectId;
    private String performanceId;

    // Getters et Setters

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

    public String getProjectUuid() {
        return projectUuid;
    }

    public void setProjectUuid(String projectUuid) {
        this.projectUuid = projectUuid;
    }

    public String getDialectId() {
        return dialectId;
    }

    public void setDialectId(String dialectId) {
        this.dialectId = dialectId;
    }

    public String getPerformanceId() {
        return performanceId;
    }

    public void setPerformanceId(String performanceId) {
        this.performanceId = performanceId;
    }
}
