package com.example.senseiVoix.dtos.facture;

import com.example.senseiVoix.enumeration.StatutFacture;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@NoArgsConstructor
public class FactureClientResponse {
    String uuid;

    public FactureClientResponse(String uuid, String code, LocalDateTime dateEmission, LocalDateTime datePaiement, double montant, StatutFacture statut, String clientUuid) {
        this.uuid = uuid;
        this.code = code;
        this.dateEmission = dateEmission;
        this.datePaiement = datePaiement;
        this.montant = montant;
        this.statut = statut;
        this.clientUuid = clientUuid;
    }

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

    public String getClientUuid() {
        return clientUuid;
    }

    public void setClientUuid(String clientUuid) {
        this.clientUuid = clientUuid;
    }

    LocalDateTime dateEmission;
    LocalDateTime datePaiement;
    double montant;
    StatutFacture statut;
    String clientUuid;
}
