package com.example.senseiVoix.entities;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

import com.example.senseiVoix.enumeration.PaymentStatus;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Inheritance
@DiscriminatorColumn(name = "dtype")
public class Payment extends BaseModel{
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "id", nullable = false)
    private Long id;
    @ManyToOne
    private Utilisateur utilisateur;
    private String libelle;
    private String rib;
    private double price;
    private String message;
    private String bankName;
    private String accountHolder;
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }
    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp = new Date();


}
