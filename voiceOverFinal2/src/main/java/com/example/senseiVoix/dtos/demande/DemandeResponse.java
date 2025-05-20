package com.example.senseiVoix.dtos.demande;

import com.example.senseiVoix.entities.Demande;
import com.example.senseiVoix.enumeration.StatutDemande;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO for {@link Demande}
 */
@Data
@NoArgsConstructor
public class DemandeResponse implements Serializable {
    String uuid;
    String code;
    Long factureId;

    public DemandeResponse(String uuid, String code, String titre, String description, StatutDemande statut, LocalDate dateCreation, String utilisateurUuid, String type, Long factureId) {
        this.uuid = uuid;
        this.code = code;
        this.titre = titre;
        this.description = description;
        this.statut = statut;
        this.dateCreation = dateCreation;
        this.utilisateurUuid = utilisateurUuid;
        this.type = type;
        this.factureId=factureId;
    }

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

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public StatutDemande getStatut() {
        return statut;
    }

    public void setStatut(StatutDemande statut) {
        this.statut = statut;
    }

    public LocalDate getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDate dateCreation) {
        this.dateCreation = dateCreation;
    }

    public String getUtilisateurUuid() {
        return utilisateurUuid;
    }

    public void setUtilisateurUuid(String utilisateurUuid) {
        this.utilisateurUuid = utilisateurUuid;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    String titre;
    String description;
    StatutDemande statut;
    LocalDate dateCreation;
    String utilisateurUuid;
    String type;



}
