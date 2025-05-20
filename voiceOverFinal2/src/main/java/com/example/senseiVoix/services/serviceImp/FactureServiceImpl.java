package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.facture.FactureClient;
import com.example.senseiVoix.dtos.facture.FactureClientResponse;
import com.example.senseiVoix.dtos.facture.FactureSpeaker;
import com.example.senseiVoix.dtos.facture.FactureSpeakerResponse;
import com.example.senseiVoix.entities.Facture;
import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.entities.Speaker;
import com.example.senseiVoix.enumeration.StatutFacture;
import com.example.senseiVoix.repositories.ClientRepository;
import com.example.senseiVoix.repositories.FactureRepository;
import com.example.senseiVoix.repositories.SpeakerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FactureServiceImpl {
    @Autowired
    private  FactureRepository factureRepository;
    @Autowired
    private SpeakerRepository speakerService;
    @Autowired
    private ClientRepository clientService;



    public FactureClientResponse ajouterFactureClient(FactureClient factureClient) {
        Facture facture = new Facture();
        facture.setClient(clientService.findByUuid(factureClient.getClientUuid()));
        facture.setMontant(factureClient.getMontant());
        facture.setStatut(factureClient.getStatut());
        facture.setDateEmission(LocalDateTime.now());
        Facture newfacture = factureRepository.save(facture);
        return new FactureClientResponse(
                newfacture.getUuid(),
                newfacture.getCode(),
                newfacture.getDateEmission()
                ,newfacture.getDatePaiement(),
                newfacture.getMontant(),
                newfacture.getStatut(),
                newfacture.getClient().getUuid()
        );
    }

    public FactureSpeakerResponse ajouterFactureSpeaker(FactureSpeaker factureSpeaker) throws IOException {
        Facture facture = new Facture();
        facture.setSpeaker(speakerService.findByUuid(factureSpeaker.getSpeakerUuid()));
        facture.setMontant(factureSpeaker.getMontant());
        facture.setStatut(factureSpeaker.getStatut());

        // Use the incoming dateEmission if provided, otherwise use current time
        facture.setDateEmission(
                factureSpeaker.getDateEmission() != null
                        ? factureSpeaker.getDateEmission()
                        : LocalDateTime.now()
        );

        // Similarly for datePaiement
        facture.setDatePaiement(factureSpeaker.getDatePaiement());
       facture.setPdfData(factureSpeaker.getPdfData().getBytes());

        Facture newFacture = factureRepository.save(facture);

        return new FactureSpeakerResponse(
                newFacture.getUuid(),
                newFacture.getCode(),
                newFacture.getDateEmission(),
                newFacture.getDatePaiement(),
                newFacture.getMontant(),
                newFacture.getStatut(),
                newFacture.getSpeaker().getUuid(),
                newFacture.getPdfData()
        );
    }
    public List<FactureClientResponse> getFacturesClient(String clientUuid) {
        List<Facture> newfacture = factureRepository.findByClient(clientUuid);
        return newfacture.stream().map(facture ->  new FactureClientResponse(
                   facture.getUuid(),
                   facture.getCode(),
                   facture.getDateEmission()
                   ,facture.getDatePaiement(),
                   facture.getMontant(),
                   facture.getStatut(),
                   facture.getClient().getUuid()

           )
        ).collect(Collectors.toList());
    }

    public List<FactureSpeakerResponse> getFacturesSpeaker(String speakerUuid) {
        List<Facture> newfacture = factureRepository.findBySpeaker(speakerUuid);
        return newfacture.stream().map(facture ->  new FactureSpeakerResponse(
                        facture.getUuid(),
                        facture.getCode(),
                        facture.getDateEmission()
                        ,facture.getDatePaiement(),
                        facture.getMontant(),
                        facture.getStatut(),
                        facture.getSpeaker().getUuid(),
                        facture.getPdfData()
                )
        ).collect(Collectors.toList());
    }

    public List<Facture> getFacturesParStatut(StatutFacture statut) {
        return factureRepository.findByStatut(statut);
    }

    public List<Facture> getFacturesApresDate(LocalDateTime date) {
        return factureRepository.findByDateEmissionAfter(date);
    }



    public Double getTotalPaidByClient(Client client) {
        return factureRepository.getTotalPaidByClient(client);
    }

    public Double getTotalPaidBySpeaker(Speaker speaker) {
        return factureRepository.getTotalPaidBySpeaker(speaker);
    }


}
