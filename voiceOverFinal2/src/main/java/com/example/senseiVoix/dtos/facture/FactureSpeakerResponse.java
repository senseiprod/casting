package com.example.senseiVoix.dtos.facture;

import com.example.senseiVoix.enumeration.StatutFacture;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@NoArgsConstructor
public class FactureSpeakerResponse {
    String uuid;
    String code;

     String message;

    // Constructor to handle error messages
    public FactureSpeakerResponse(String message) {
        this.message = message;
    }

     byte[] pdfData;

    public FactureSpeakerResponse(String uuid, String code, LocalDateTime dateEmission, LocalDateTime datePaiement, double montant, StatutFacture statut, String speakerUuid,byte[] pdfData) {
        this.uuid = uuid;
        this.code = code;
        this.dateEmission = dateEmission;
        this.datePaiement = datePaiement;
        this.montant = montant;
        this.statut = statut;
        this.speakerUuid = speakerUuid;
        this.pdfData = pdfData;
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

    public LocalDateTime getDateEmission() {
        return dateEmission;
    }

    public void setDateEmission(LocalDateTime dateEmission) {
        this.dateEmission = dateEmission;
    }

    public LocalDateTime getDatePaiement() {
        return datePaiement;
    }

    public void setDatePaiement(LocalDateTime datePaiement) {
        this.datePaiement = datePaiement;
    }

    public double getMontant() {
        return montant;
    }

    public void setMontant(double montant) {
        this.montant = montant;
    }



    public StatutFacture getStatut() {
        return statut;
    }

    public void setStatut(StatutFacture statut) {
        this.statut = statut;
    }

    public String getSpeakerUuid() {
        return speakerUuid;
    }

    public void setSpeakerUuid(String speakerUuid) {
        this.speakerUuid = speakerUuid;
    }

    @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateEmission;

    @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime datePaiement;

    double montant;
    StatutFacture statut;
    String speakerUuid;
}
