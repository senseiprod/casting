package com.example.senseiVoix.services.serviceImp;
import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.entities.PaiementVerment;
import com.example.senseiVoix.entities.Payment;
import com.example.senseiVoix.enumeration.PaymentStatus;
import com.example.senseiVoix.repositories.ClientRepository;
import com.example.senseiVoix.repositories.PaiementVermentRepository;
import com.example.senseiVoix.repositories.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@Service
public class PaiementService {
    @Autowired
    private PaiementVermentRepository paiementRepository;
    @Autowired
    private ClientRepository utilisateurRepository;
    @Autowired
    private PaymentRepository paymentRepository;



    public PaiementVerment creerPaiement(String uuid, PaiementVerment paiement) throws IOException, GeneralSecurityException {
        Client client = utilisateurRepository.findByUuid(uuid);
        paiement.setUtilisateur(client);
        paiement.setStatus(PaymentStatus.PENDING);
        return paiementRepository.save(paiement);
    }

    public List<PaiementVerment> getPaiementsEnAttente() {
        return paiementRepository.findByStatut(PaymentStatus.PENDING);
    }

    public PaiementVerment validerPaiement(String paiementId) {
        PaiementVerment paiement = paiementRepository.findByUuid(paiementId);
        paiement.setStatus(PaymentStatus.COMPLETED);

        // Ajouter les points au compte client
        Client client = (Client) paiement.getUtilisateur();
        int pointsAjoutes = (int) (paiement.getAmount() * 10); // 1 MAD = 10 points
        client.setBalance(client.getBalance() + pointsAjoutes);
        utilisateurRepository.save(client);

        return paiementRepository.save(paiement);
    }

    public PaiementVerment refuserPaiement(Long paiementId) {
        PaiementVerment paiement = paiementRepository.findById(paiementId)
                .orElseThrow(() -> new RuntimeException("Paiement non trouvé"));
        paiement.setStatus(PaymentStatus.FAILED);
        return paiementRepository.save(paiement);
    }

    public List<Payment> getAllPayements() {
        return paymentRepository.findByStatut(PaymentStatus.PENDING);
    }

    public List<Payment> getAllCompletedPayements() {
        return paymentRepository.findByStatut(PaymentStatus.COMPLETED);
    }
}
