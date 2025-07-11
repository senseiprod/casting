package com.example.senseiVoix.dtos.transaction;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * DTO for {@link com.example.senseiVoix.entities.Transactionss}
 */
@NoArgsConstructor
@AllArgsConstructor
public class TransactionssDto implements Serializable {
    double montant;
    LocalDateTime dateTransaction;

    public double getMontant() {
        return montant;
    }

    public void setMontant(double montant) {
        this.montant = montant;
    }

    public LocalDateTime getDateTransaction() {
        return dateTransaction;
    }

    public void setDateTransaction(LocalDateTime dateTransaction) {
        this.dateTransaction = dateTransaction;
    }

    public String getFactureUuid() {
        return factureUuid;
    }

    public void setFactureUuid(String factureUuid) {
        this.factureUuid = factureUuid;
    }

    String factureUuid;
}
