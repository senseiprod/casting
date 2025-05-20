package com.example.senseiVoix.repositories;

import com.example.senseiVoix.dtos.facture.FactureSpeakerResponse;
import com.example.senseiVoix.entities.Facture;
import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.entities.Speaker;
import com.example.senseiVoix.enumeration.StatutFacture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FactureRepository extends JpaRepository<Facture, Long> {

    @Query("SELECT f FROM Facture f WHERE f.client.uuid=:clientUuid")
    List<Facture> findByClient(@Param("clientUuid") String clientUuid);

    @Query("SELECT f FROM Facture f WHERE f.speaker.uuid=:clientUuid")
    List<Facture> findBySpeaker(@Param("clientUuid") String clientUuid);

    // Trouver les factures en fonction du statut
    List<Facture> findByStatut(StatutFacture statut);

    // Trouver les factures émises après une certaine date
    List<Facture> findByDateEmissionAfter(LocalDateTime date);

    // Trouver les factures par montant supérieur à une valeur donnée
    List<Facture> findByMontantGreaterThanEqual(double montant);

    // Trouver les factures en attente d’un client
    List<Facture> findByClientAndStatut(Client client, StatutFacture statut);

    // Trouver les factures en attente d’un speaker
    List<Facture> findBySpeakerAndStatut(Speaker speaker, StatutFacture statut);

    // Trouver toutes les factures payées entre deux dates
    List<Facture> findByStatutAndDateEmissionBetween(StatutFacture statut, LocalDateTime startDate, LocalDateTime endDate);

    // Obtenir le total des factures payées pour un client
    @Query("SELECT SUM(f.montant) FROM Facture f WHERE f.client = :client AND f.statut = 'PAYÉE'")
    Double getTotalPaidByClient(Client client);

    // Obtenir le total des factures payées pour un speaker
    @Query("SELECT SUM(f.montant) FROM Facture f WHERE f.speaker = :speaker AND f.statut = 'PAYÉE'")
    Double getTotalPaidBySpeaker(Speaker speaker);

    // Vérifier si un client a une facture en attente
    boolean existsByClientAndStatut(Client client, StatutFacture statut);

    // Vérifier si un speaker a une facture en attente
    boolean existsBySpeakerAndStatut(Speaker speaker, StatutFacture statut);
    @Query("SELECT f FROM Facture f WHERE f.uuid=:clientUuid")
    Facture findByUuid(@Param("clientUuid") String clientUuid);

    @Query("SELECT new com.example.senseiVoix.dtos.facture.FactureSpeakerResponse(f.uuid, f.code, f.dateEmission, f.datePaiement, f.montant, f.statut, f.speaker.uuid, f.pdfData) FROM Facture f WHERE f.id = :id")
    FactureSpeakerResponse getFactureById(@Param("id") Long id);


}
