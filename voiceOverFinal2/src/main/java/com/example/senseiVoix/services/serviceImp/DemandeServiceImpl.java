package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.IMapClassWithDto;
import com.example.senseiVoix.dtos.demande.DemandeRequest;
import com.example.senseiVoix.dtos.demande.DemandeResponse;
import com.example.senseiVoix.dtos.notification.NotificationMessage;
import com.example.senseiVoix.entities.*;
import com.example.senseiVoix.enumeration.RoleUtilisateur;
import com.example.senseiVoix.enumeration.TypeStatus;
import com.example.senseiVoix.exceptions.ResourceNotFoundException;
import com.example.senseiVoix.repositories.*;
import com.example.senseiVoix.services.DemandeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.senseiVoix.enumeration.StatutDemande;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class DemandeServiceImpl implements DemandeService {
    @Autowired
    private  DemandeRepository demandeRepository;
    @Autowired
    private  RecordRepository  recordRepository;
    @Autowired
    private IMapClassWithDto<Demande, DemandeRequest> requestMaperClass;
    @Autowired
    private UtilisateurRepository userRepo;
    @Autowired
    private EmailService emailService;
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    @Autowired
    private PaypalService paypalService;
    @Autowired
    private FactureRepository factureRepository;
    @Autowired
    private TokenRepository tokenRepository;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    @Override
    public List<DemandeResponse> getAllDemandes() {
        List<Demande> listDEmande = demandeRepository.findAll();
        List<DemandeResponse> listDemandes = new ArrayList<>();
        for(Demande demande : listDEmande){
            DemandeResponse demandeResponse = new DemandeResponse(demande.getUuid(), demande.getCode(), demande.getTitre(), demande.getDescription(), demande.getStatut(), demande.getDateCreation(), demande.getUtilisateur().getUuid(), demande.getType().toString(), demande.getFacture() != null ? demande.getFacture().getId() : null
            );
            listDemandes.add(demandeResponse);
        }
        return listDemandes;

    }
    @Override
    public Optional<Demande> getDemandeById(Long id) {
        return demandeRepository.findById(id);
    }
    @Override
    public DemandeResponse getDemandeByUuid(String uuid) {
        Demande demande = demandeRepository.findByUuid(uuid);
        DemandeResponse demandeResponse = new DemandeResponse(demande.getUuid(), demande.getCode(), demande.getTitre(), demande.getDescription(), demande.getStatut(), demande.getDateCreation(), demande.getUtilisateur().getUuid(), demande.getType().toString(),demande.getFacture() != null ? demande.getFacture().getId() : null
        );
        return demandeResponse;
    }
    @Override
    public List<DemandeResponse> getDemandesByDemandeurUuid(String uuid) {
        List<Demande> listDEmande =  demandeRepository.findByDemandeurUuid(uuid);
        List<DemandeResponse> listDemandes = new ArrayList<>();
        for(Demande demande : listDEmande){
            DemandeResponse demandeResponse = new DemandeResponse(demande.getUuid(), demande.getCode(), demande.getTitre(), demande.getDescription(), demande.getStatut(), demande.getDateCreation(), demande.getUtilisateur().getUuid(), demande.getType().toString(),demande.getFacture() != null ? demande.getFacture().getId() : null
            );
            listDemandes.add(demandeResponse);
        }
        return listDemandes;
    }
    @Override
    public List<DemandeResponse> getDemandesEnAttente() {
        List<Demande> listDEmande = demandeRepository.findEnAttente();
        List<DemandeResponse> listDemandes = new ArrayList<>();
        for(Demande demande : listDEmande){
            DemandeResponse demandeResponse = new DemandeResponse(demande.getUuid(), demande.getCode(), demande.getTitre(), demande.getDescription(), demande.getStatut(), demande.getDateCreation(), demande.getUtilisateur().getUuid(), demande.getType().toString(),demande.getFacture() != null ? demande.getFacture().getId() : null
            );
            listDemandes.add(demandeResponse);
        }
        return listDemandes;


    }
    @Override

    public List<DemandeResponse> getDemandesAcceptees() {
        List<Demande> listDEmande = demandeRepository.findAcceptees();
        List<DemandeResponse> listDemandes = new ArrayList<>();
        for(Demande demande : listDEmande){
            DemandeResponse demandeResponse = new DemandeResponse(demande.getUuid(), demande.getCode(), demande.getTitre(), demande.getDescription(), demande.getStatut(), demande.getDateCreation(), demande.getUtilisateur().getUuid(), demande.getType().toString(),demande.getFacture() != null ? demande.getFacture().getId() : null
            );
            listDemandes.add(demandeResponse);
        }
        return listDemandes;

    }
    @Override

    public List<DemandeResponse> getDemandesRefusees() {
        List<Demande> listDEmande = demandeRepository.findRefusees();
        List<DemandeResponse> listDemandes = new ArrayList<>();
        for(Demande demande : listDEmande){
            DemandeResponse demandeResponse = new DemandeResponse(demande.getUuid(), demande.getCode(), demande.getTitre(), demande.getDescription(), demande.getStatut(), demande.getDateCreation(), demande.getUtilisateur().getUuid(), demande.getType().toString(),demande.getFacture() != null ? demande.getFacture().getId() : null
            );
            listDemandes.add(demandeResponse);
        }
        return listDemandes;

    }
    @Override
    public Long countDemandesEnAttente() {
        return demandeRepository.countEnAttente();
    }
    @Override
    public Long countDemandesAcceptees() {
        return demandeRepository.countAcceptees();
    }
    @Override
    public Long countDemandesRefusees() {
        return demandeRepository.countRefusees();
    }
    @Override
    public List<DemandeResponse> getDemandesNonSupprimees() {
        List<Demande> listDEmande = demandeRepository.findAllByDeletedFalse();
        List<DemandeResponse> listDemandes = new ArrayList<>();
        for(Demande demande : listDEmande){
            DemandeResponse demandeResponse = new DemandeResponse(demande.getUuid(), demande.getCode(), demande.getTitre(), demande.getDescription(), demande.getStatut(), demande.getDateCreation(), demande.getUtilisateur().getUuid(), demande.getType().toString(),demande.getFacture() != null ? demande.getFacture().getId() : null
            );
            listDemandes.add(demandeResponse);
        }
        return listDemandes;
    }
    @Override
    public List<DemandeResponse> getDemandesSupprimees() {
        List<Demande> listDEmande = demandeRepository.findAllByDeletedTrue();
        List<DemandeResponse> listDemandes = new ArrayList<>();
        for(Demande demande : listDEmande){
            DemandeResponse demandeResponse = new DemandeResponse(demande.getUuid(), demande.getCode(), demande.getTitre(), demande.getDescription(), demande.getStatut(), demande.getDateCreation(), demande.getUtilisateur().getUuid(), demande.getType().toString(),demande.getFacture() != null ? demande.getFacture().getId() : null
            );
            listDemandes.add(demandeResponse);
        }
        return listDemandes;
    }
    @Override
    public DemandeResponse  createDemande(DemandeRequest demandeRequest) {
        if (demandeRequest != null) {
            Utilisateur user = userRepo.findByUuid(demandeRequest.getUtilisateurUuid());
            if (user!= null) {
                Demande newDemande = requestMaperClass.convertToEntity(demandeRequest, Demande.class);
                if(demandeRequest.getType().equals("RETRAIT")){
                    newDemande.setType(TypeStatus.RETRAIT);

                }
                else if (demandeRequest.getType().equals("COMPTE")){
                    newDemande.setType(TypeStatus.COMPTE);
                    NotificationMessage notif = new NotificationMessage();
                    notif.setTitle("New Demande Submitted");
                    notif.setMessage("Client " + user.getNom() + " " + user.getPrenom() + " submitted a new demande.");

                    messagingTemplate.convertAndSend("/topic/admin", notif);
                }
                else {
                    newDemande.setType(TypeStatus.RECORDE);
                }
                newDemande.setUtilisateur(user);
                newDemande.setStatut(StatutDemande.EN_ATTENTE);
                newDemande.setTitre(demandeRequest.getTitre());
                newDemande.setDescription(demandeRequest.getDescription());
                // Find and set the facture by ID
                if (demandeRequest.getFactureId() != null) {
                    Facture facture = factureRepository.findById(demandeRequest.getFactureId())
                            .orElseThrow(() -> new ResourceNotFoundException(
                                    "Facture not found with id: " + demandeRequest.getFactureId()));
                    newDemande.setFacture(facture);
                }
                Demande demande = demandeRepository.save(newDemande);
                emailService.sendDmandeRecord(user.getEmail(), user.getNom()+" "+user.getPrenom(), LocalDate.now());
                DemandeResponse demandeResponse = new DemandeResponse(demande.getUuid(), demande.getCode(), demande.getTitre(), demande.getDescription(), demande.getStatut(), demande.getDateCreation(), demande.getUtilisateur().getUuid(),demande.getType().toString(),demande.getFacture() != null ? demande.getFacture().getId() : null
                );
                return demandeResponse;            
            }


        }
        return null ;
    }


    @Override
    public DemandeResponse updateDemande(String uuid, String status) {
        // Find the demande by UUID
        Demande demande = demandeRepository.findByUuid(uuid);
        if (demande == null) {
            throw new RuntimeException("Demande not found with UUID: " + uuid);
        }

        // Convert status to enum safely
        StatutDemande statut;
        switch (status.toLowerCase()) {
            case "refuse":
                statut = StatutDemande.REJETEE;
                break;
            case "accepte":
                statut = StatutDemande.ACCEPTEE;
                break;
            default:
                throw new IllegalArgumentException("Invalid status: " + status);
        }

        // Update demande status
        demande.setStatut(statut);

        // If demande is accepted, convert Client to Speaker
        if (StatutDemande.ACCEPTEE.equals(statut) && demande.getType().equals(TypeStatus.COMPTE)) {
            Utilisateur utilisateur = demande.getUtilisateur();
            if (utilisateur instanceof Client) { // Ensure the user is a Client
                Client client = (Client) utilisateur;

                // Get all needed data from client
                 // Store the ID
                String uuid_client = client.getUuid();
                Integer id = client.getId();
                String nom = client.getNom();
                String prenom = client.getPrenom();
                String email = client.getEmail();
                String motDePasse = client.getMotDePasse();
                String phone = client.getPhone();
                String username = client.getUsername();


                deleteTokensForUser(id);

                // Now that tokens are deleted, we can delete the client
                userRepo.delete(client);
                userRepo.flush();

                // Create and save the Speaker
                Speaker speaker = new Speaker();
                 // Use the same ID to maintain references
                speaker.setUuid(uuid_client);
                speaker.setNom(nom);
                speaker.setPrenom(prenom);
                speaker.setEmail(email);
                speaker.setMotDePasse(motDePasse);
                speaker.setPhone(phone);
                speaker.setUsername(username);
                speaker.setRole(RoleUtilisateur.SPEAKER);
                speaker.setEarnings(0.0);

                speaker = userRepo.save(speaker);

                // Update demande to point to the new Speaker
                demande.setUtilisateur(speaker);
                demandeRepository.save(demande);
            }
        }
        else if((StatutDemande.ACCEPTEE.equals(statut) && demande.getType().equals(TypeStatus.RETRAIT))){

            Utilisateur speaker = demande.getUtilisateur();
            if(speaker instanceof Speaker) {
                 try {
                    // Make payment
                   /* String batchId = paypalService.sendMoneyThroughPayouts(
                            speaker.getEmail(),
                            ((Speaker) speaker).getEarnings(),
                            "USD",
                            "Payment validated by admin",
                            "d616c0360ca4aef2141cede9f700bc7e91810d432186a22561f715ed71870362"
                    );

                    // Only if we got here without exceptions, then set earnings to 0
                    ((Speaker) speaker).setEarnings(0.0); */
                    utilisateurRepository.save(speaker);  // Make sure to save the changes

                    // Log the successful payment
                    System.out.println("Payment sent with batch ID: ");
                } catch (Exception e) {
                    // Log the error but don't set earnings to 0
                    System.err.println("Payment failed: " + e.getMessage());
                    throw new RuntimeException(e);
                }
            }


        }

        else {
            // Just save demande status change if not accepted
            demandeRepository.save(demande);
        }

        // Return updated demande response
        return new DemandeResponse(
                demande.getUuid(),
                demande.getCode(),
                demande.getTitre(),
                demande.getDescription(),
                demande.getStatut(),
                demande.getDateCreation(),
                demande.getUtilisateur().getUuid(),
                demande.getType().toString(),
                demande.getFacture() != null ? demande.getFacture().getId() : null

        );
    }

    // You'll need to implement this based on your actual data model
    private void deleteTokensForUser(Integer userId) {
        // Delete all tokens for the user directly with a query
        // This is more reliable than finding and deleting them individually
        tokenRepository.deleteAllByUserId(userId);
        tokenRepository.flush(); // Ensure changes are committed
    }

    @Override

    public void deleteDemande(String uuid) {
        Demande demande = demandeRepository.findByUuid(uuid);
        if (demande!= null) {
            demande.setDeleted(true);
            demandeRepository.save(demande);
        }
        else {
            throw new RuntimeException("Demande not found with uuid: " + uuid);
        }
    }
}
