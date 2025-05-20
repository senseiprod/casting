package com.example.senseiVoix.entities;

import com.example.senseiVoix.enumeration.StatutFacture;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Facture extends BaseModel {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "id", nullable = false)
    private Long id;

    private LocalDateTime dateEmission;
    private LocalDateTime datePaiement;

    private double montant;


    @Basic(fetch = FetchType.LAZY)
    @Column(columnDefinition = "BYTEA")
    private byte[] pdfData;

    @OneToOne
    @JsonIgnore
    private Demande demandeRetrait;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutFacture statut;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne
    @JoinColumn(name = "speaker_id")
    private Speaker speaker;

    @OneToMany(mappedBy = "facture", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Transactionss> transactions;




}
