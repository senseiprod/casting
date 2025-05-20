package com.example.senseiVoix.dtos.facture;

import com.example.senseiVoix.enumeration.StatutFacture;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * DTO for {@link com.example.senseiVoix.entities.Facture}
 */
@NoArgsConstructor
@AllArgsConstructor
public class FactureDto implements Serializable {
    String uuid;
    String code;
    LocalDateTime dateEmission;
    LocalDateTime datePaiement;
    double montant;
    byte[] pdfData;
    StatutFacture statut;
    String clientUuid;
    String speakerUuid;
}