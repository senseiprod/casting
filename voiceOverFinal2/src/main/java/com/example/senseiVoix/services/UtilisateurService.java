package com.example.senseiVoix.services;

import com.example.senseiVoix.dtos.utilisateur.UtilisateurRequest;
import com.example.senseiVoix.entities.Admin;
import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.entities.Speaker;
import com.example.senseiVoix.entities.Utilisateur;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface UtilisateurService {
    // Méthode pour enregistrer l'image en base de données
    Utilisateur savePhoto(String userId, MultipartFile file) throws IOException;

    // Méthode pour récupérer l'image depuis la base de données
    byte[] getPhoto(String userId);

    Utilisateur findById(String id);

    // Méthode pour récupérer tous les utilisateurs
    List<Utilisateur> getAllUsers();



    // Méthode pour créer un administrateur
    Admin createAdmin(Admin admin);

    // Méthode pour créer un client
    Client createClient(Client client);

    // Méthode pour créer un speaker
    Speaker createSpeaker(Speaker speaker);

    // Méthode pour supprimer un utilisateur par son ID
    void deleteUser(Long id);

    Utilisateur updateUser(Long id, UtilisateurRequest utilisateur);
}
