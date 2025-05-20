package com.example.senseiVoix.services;

import com.example.senseiVoix.dtos.demande.DemandeRequest;
import com.example.senseiVoix.dtos.demande.DemandeResponse;
import com.example.senseiVoix.entities.Demande;

import java.util.List;
import java.util.Optional;

public interface DemandeService {
    List<DemandeResponse> getAllDemandes();

    Optional<Demande> getDemandeById(Long id);

    DemandeResponse getDemandeByUuid(String uuid);

    List<DemandeResponse> getDemandesByDemandeurUuid(String uuid);

    List<DemandeResponse> getDemandesEnAttente();

    List<DemandeResponse> getDemandesAcceptees();

    List<DemandeResponse> getDemandesRefusees();

    Long countDemandesEnAttente();

    Long countDemandesAcceptees();

    Long countDemandesRefusees();

    List<DemandeResponse> getDemandesNonSupprimees();

    List<DemandeResponse> getDemandesSupprimees();

    DemandeResponse  createDemande(DemandeRequest demande);

    DemandeResponse updateDemande(String uuid, String status);

    void deleteDemande(String uuid);
}
