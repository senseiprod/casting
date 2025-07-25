package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.utilisateur.UtilisateurRequest;
import com.example.senseiVoix.services.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.example.senseiVoix.entities.*;
import com.example.senseiVoix.repositories.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import java.io.IOException;

@Service
public class UtilisateurServiceImpl implements UtilisateurService {
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    @Autowired
    private AdminRepository adminRepository;
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private SpeakerRepository speakerRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    // Méthode pour enregistrer l'image en base de données
    @Override
    public Utilisateur savePhoto(String userId, MultipartFile file) throws IOException {
        Utilisateur utilisateur = utilisateurRepository.findByUuid(userId);
        utilisateur.setPhoto(file.getBytes());
        return utilisateurRepository.save(utilisateur);
    }

    @Override

    // Méthode pour récupérer l'image depuis la base de données
    public byte[] getPhoto(String userId) {
        Utilisateur utilisateur = utilisateurRepository.findByUuid(userId);
        return utilisateur.getPhoto();
    }

    public List<Utilisateur> getAllUsers() {
        return utilisateurRepository.findAll();
    }

    public Optional<Utilisateur> getUserById(Long id) {
        return utilisateurRepository.findById(id);
    }

    public Admin createAdmin(Admin admin) {
        admin.setId(null);
        admin.setMotDePasse(passwordEncoder.encode(admin.getMotDePasse()));
        return adminRepository.save(admin);
    }

    public Client createClient(Client client) {
        client.setId(null);
        client.setMotDePasse(passwordEncoder.encode(client.getMotDePasse()));
        return clientRepository.save(client);
    }

    public Speaker createSpeaker(Speaker speaker) {
        speaker.setId(null);
        speaker.setMotDePasse(passwordEncoder.encode(speaker.getMotDePasse()));
        return speakerRepository.save(speaker);
    }

    public void deleteUser(Long id) {
        utilisateurRepository.deleteById(id);
    }

    @Override
    public Utilisateur findById(String id) {
        return utilisateurRepository.findByUuid(id);
    }

    public Utilisateur updateUser(String id, UtilisateurRequest dto) {
        Utilisateur existingUtilisateur = utilisateurRepository.findByUuid(id);

        if (existingUtilisateur != null) {
            // Update all the specified fields if they're provided in the DTO
            if (dto.getCode() != null)
                existingUtilisateur.setCode(dto.getCode());
            if (dto.getDeleted() != null)
                existingUtilisateur.setDeleted(dto.getDeleted());
            // Generally you don't update the ID as it's a primary key
            if (dto.getNom() != null)
                existingUtilisateur.setNom(dto.getNom());
            if (dto.getPrenom() != null)
                existingUtilisateur.setPrenom(dto.getPrenom());
            if (dto.getEmail() != null)
                existingUtilisateur.setEmail(dto.getEmail());
            if (dto.getPhone() != null)
                existingUtilisateur.setPhone(dto.getPhone());
            if (dto.getVerified() != null)
                existingUtilisateur.setVerified(dto.getVerified());
            if (dto.getRole() != null)
                existingUtilisateur.setRole(dto.getRole());
            if (dto.getPhoto() != null)
                existingUtilisateur.setPhoto(dto.getPhoto());

            // Check if these properties exist on your entity before updating
            // For the Balance and Fidelity fields that weren't in the original code
            if (dto.getBalance() != null && hasProperty(existingUtilisateur, "balance")) {
                setProperty(existingUtilisateur, "balance", dto.getBalance());
            }
            if (dto.getFidelity() != null && hasProperty(existingUtilisateur, "fidelity")) {
                setProperty(existingUtilisateur, "fidelity", dto.getFidelity());
            }

            if (existingUtilisateur instanceof Client && dto.getFree_test() != null) {
                Client client = (Client) existingUtilisateur;
                client.setFree_test(dto.getFree_test());
            }

            return utilisateurRepository.save(existingUtilisateur);
        } else {
            return null;
        }
    }

    // Helper methods to check and set properties using reflection
    private boolean hasProperty(Object obj, String propertyName) {
        try {
            obj.getClass().getDeclaredField(propertyName);
            return true;
        } catch (NoSuchFieldException e) {
            return false;
        }
    }

    private void setProperty(Object obj, String propertyName, Object value) {
        try {
            java.lang.reflect.Field field = obj.getClass().getDeclaredField(propertyName);
            field.setAccessible(true);
            field.set(obj, value);
        } catch (Exception e) {
            // Handle the exception appropriately
        }
    }
}
