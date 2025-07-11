package com.example.senseiVoix.entities;

import com.example.senseiVoix.enumeration.StatutDemande;
import com.example.senseiVoix.enumeration.TypeStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Demande extends BaseModel{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TypeStatus getType() {
        return type;
    }

    public void setType(TypeStatus type) {
        this.type = type;
    }

    private String description;

    @Enumerated(EnumType.STRING)
    private StatutDemande statut ;

    @Enumerated(EnumType.STRING)
    private TypeStatus type ;

    private LocalDate dateCreation = LocalDate.now();

    @OneToOne
    @JsonIgnore
    private Facture facture;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id") // Peut être un Client ou un Speaker
    private Utilisateur utilisateur;

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

    public LocalDate getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDate dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    public void setStatut(StatutDemande statut) {
        this.statut = statut;
    }

}
