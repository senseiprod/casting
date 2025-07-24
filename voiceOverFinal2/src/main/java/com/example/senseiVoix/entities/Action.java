package com.example.senseiVoix.entities;

import com.example.senseiVoix.enumeration.ActionAccessType;
import com.example.senseiVoix.enumeration.StatutAction;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Action extends BaseModel{
    public Audio getAudio() {
        return audio;
    }

    public void setAudio(Audio audio) {
        this.audio = audio;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20000)
    private String text;

    @OneToOne(fetch = FetchType.LAZY)
    private Audio audio;

    @Enumerated(EnumType.STRING)
    private StatutAction statutAction;

    @Enumerated(EnumType.STRING)
    private ActionAccessType actionAccessType;

    @ManyToOne
    @JsonIgnore
    private Project project;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public byte[] getAudioGenerated() {
        return audioGenerated;
    }

    public void setAudioGenerated(byte[] audioGenerated) {
        this.audioGenerated = audioGenerated;
    }

    public Voix getVoice() {
        return voice;
    }

    public void setVoice(Voix voice) {
        this.voice = voice;
    }

    public Date getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(Date dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    private String language ;
    @Column(columnDefinition = "BYTEA")
    private byte[] audioGenerated ;

    @ManyToOne
    private Voix voice;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateCreation = new Date();

    @ManyToOne
    @JoinColumn(name = "utilisateur_id", nullable = false)
    @JsonIgnore
    private Utilisateur utilisateur;

    // NEW FIELD FOR BANK TRANSFER IDENTIFICATION
    @Column(unique = true)
    private String libelle;
}
