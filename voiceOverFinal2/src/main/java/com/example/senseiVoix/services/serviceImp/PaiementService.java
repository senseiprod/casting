package com.example.senseiVoix.services.serviceImp;
import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.entities.PaiementVerment;
import com.example.senseiVoix.entities.Payment;
import com.example.senseiVoix.enumeration.PaymentStatus;
import com.example.senseiVoix.repositories.ClientRepository;
import com.example.senseiVoix.repositories.PaiementVermentRepository;
import com.example.senseiVoix.repositories.PaymentRepository;
import com.paypal.base.rest.PayPalRESTException;
import com.stripe.model.Charge.PaymentMethodDetails.Paypal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;
import java.util.Locale;

@Service
public class PaiementService {
    @Autowired
    private PaiementVermentRepository paiementRepository;
    @Autowired
    private ClientRepository utilisateurRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private PaypalService paypalService;



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

    public void setBalanceClient(String uuid, Double balance) {
        Client client = utilisateurRepository.findByUuid(uuid);
        client.setBalance(balance);
        utilisateurRepository.save(client);
    }

    public String chargeBalanceClient(String uuid, double amount) throws PayPalRESTException {
        if (uuid == null || uuid.trim().isEmpty()) {
            throw new IllegalArgumentException("UUID must not be null or empty.");
        }
    
        if (amount <= 0.0) {
            throw new IllegalArgumentException("Amount must be greater than zero.");
        }
    
        String formattedAmount = String.format(Locale.US, "%.2f", amount); // 👈 FORMAT CORRECT ICI
        final String currency = "USD";
        final String description = "Add more credits";
        final String cancelUrl = String.format("http://localhost:8080/api/payment/balance/cancel/%s", uuid);
        
        // ✅ Ne PAS reformatter avec %.2f, utiliser formattedAmount
        final String successUrl = String.format("http://localhost:8080/api/payment/balance/success/%s/%s", uuid, formattedAmount);
    
        com.paypal.api.payments.Payment payment = paypalService.createPayment(
            amount,
            currency,
            description,
            cancelUrl,
            successUrl
        );
    
        for (com.paypal.api.payments.Links link : payment.getLinks()) {
            if ("approval_url".equalsIgnoreCase(link.getRel())) {
                return link.getHref();
            }
        }
    
        throw new IllegalStateException("Approval URL not found in PayPal response.");
    }
    
    
}
