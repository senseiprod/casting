package com.example.senseiVoix.services.serviceImp;
import com.example.senseiVoix.dtos.action.BankTransferResponse;
import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.entities.PaiementVerment;
import com.example.senseiVoix.entities.Payment;
import com.example.senseiVoix.entities.Utilisateur;
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

    private static final String COMPANY_RIB = "FR76 1234 5678 9012 3456 7890 123";
    private static final String BANK_NAME = "Banque Exemple";
    private static final String ACCOUNT_HOLDER = "SenseiVoix SARL";



    public List<Payment> getAllPayements() {
        return paymentRepository.findAll();
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
        final String cancelUrl = String.format("https://api.castingvoixoff.ma/api/payment/balance/cancel/%s", uuid);
        
        // ✅ Ne PAS reformatter avec %.2f, utiliser formattedAmount
        final String successUrl = String.format("https://api.castingvoixoff.ma/api/payment/balance/success/%s/%s", uuid, formattedAmount);
    
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
    
        public BankTransferResponse createBankTransferResponse(String uuid, double price) {
        try {
           Utilisateur utilisateur =  utilisateurRepository.findByUuid(uuid);
           Payment payment = new Payment();
            payment.setUtilisateur(utilisateur);
            payment.setLibelle(generateUniqueLibelle());
            // Generate unique libellé and update action
            String libelle = generateUniqueLibelle();
            // Create response
            BankTransferResponse response = new BankTransferResponse();
            response.setLibelle(libelle);
            response.setRib(COMPANY_RIB);
            response.setPrice(price);
            response.setBankName(BANK_NAME);
            response.setAccountHolder(ACCOUNT_HOLDER);
            response.setMessage("Action créée avec succès. Effectuez le virement bancaire avec le libellé fourni.");

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Failed to create bank transfer response: " + e.getMessage());
        }
    }

    private String generateUniqueLibelle() {
        String prefix = "SV";
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = String.valueOf((int)(Math.random() * 1000));
        return prefix + timestamp.substring(timestamp.length() - 8) + random;
    }
}
