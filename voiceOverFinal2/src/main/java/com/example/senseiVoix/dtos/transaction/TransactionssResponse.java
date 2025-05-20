package com.example.senseiVoix.dtos.transaction;

import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * DTO for {@link com.example.senseiVoix.entities.Transactionss}
 */
@NoArgsConstructor
public class TransactionssResponse implements Serializable {
    String uuid;
    String code;

    public TransactionssResponse(String uuid, String code, double montant, LocalDateTime dateTransaction, String factureUuid) {
        this.uuid = uuid;
        this.code = code;
        this.montant = montant;
        this.dateTransaction = dateTransaction;
        this.factureUuid = factureUuid;
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

    double montant;
    LocalDateTime dateTransaction;
    String factureUuid;
}