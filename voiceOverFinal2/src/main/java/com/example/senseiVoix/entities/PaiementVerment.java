package com.example.senseiVoix.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.sql.Blob;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@DiscriminatorValue("VERMENT")
public class    PaiementVerment extends Payment{

    private String devise ;

    public String getDevise() {
        return devise;
    }

    public void setDevise(String devise) {
        this.devise = devise;
    }

    public String getBanque() {
        return banque;
    }

    public void setBanque(String banque) {
        this.banque = banque;
    }

    public String getReferenceTransaction() {
        return referenceTransaction;
    }

    public void setReferenceTransaction(String referenceTransaction) {
        this.referenceTransaction = referenceTransaction;
    }

    public Blob getScreenshotUrl() {
        return screenshotUrl;
    }

    public void setScreenshotUrl(Blob screenshotUrl) {
        this.screenshotUrl = screenshotUrl;
    }

    private String banque;

    private String referenceTransaction;
    @Lob
    private Blob screenshotUrl;

}
