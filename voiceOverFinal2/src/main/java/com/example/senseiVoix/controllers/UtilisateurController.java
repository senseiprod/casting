package com.example.senseiVoix.controllers;

import com.example.senseiVoix.dtos.utilisateur.UtilisateurRequest;
import com.example.senseiVoix.entities.Admin;
import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.entities.Speaker;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.services.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/utilisateurs")
@CrossOrigin("*")
public class UtilisateurController {
    @Autowired
    private UtilisateurService utilisateurService;

    // Endpoint pour uploader une image
    @PostMapping("/{id}/uploadPhoto")
    public ResponseEntity<String> uploadPhoto(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        try {
            utilisateurService.savePhoto(id, file);
            return ResponseEntity.ok("Image enregistrée avec succès !");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Erreur lors de l'upload de l'image");
        }
    }

    // Endpoint pour récupérer une image
    @GetMapping("/{id}/photo")
    public ResponseEntity<byte[]> getPhoto(@PathVariable String id) {
        byte[] imageData = utilisateurService.getPhoto(id);
        if (imageData != null) {
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG) // Adapter au format (PNG, etc.)
                    .body(imageData);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoint pour récupérer tous les utilisateurs
    @GetMapping
    public ResponseEntity<List<Utilisateur>> getAllUsers() {
        List<Utilisateur> users = utilisateurService.getAllUsers();
        return ResponseEntity.ok(users);
    }




    // Endpoint pour récupérer un utilisateur par ID
    @GetMapping("/{id}")
    public ResponseEntity<Utilisateur> getUserById(@PathVariable String id) {
        Utilisateur utilisateur = utilisateurService.findById(id);
        if (utilisateur != null) {
            return ResponseEntity.ok(utilisateur);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoint pour créer un nouvel administrateur
    @PostMapping("/admin")
    public ResponseEntity<Admin> createAdmin(@RequestBody Admin admin) {
        Admin createdAdmin = utilisateurService.createAdmin(admin);
        return ResponseEntity.ok(createdAdmin);
    }

    // Endpoint pour créer un nouveau client
    @PostMapping("/client")
    public ResponseEntity<Client> createClient(@RequestBody Client client) {
        Client createdClient = utilisateurService.createClient(client);
        return ResponseEntity.ok(createdClient);
    }

    // Endpoint pour créer un nouveau speaker
    @PostMapping("/speaker")
    public ResponseEntity<Speaker> createSpeaker(@RequestBody Speaker speaker) {
        Speaker createdSpeaker = utilisateurService.createSpeaker(speaker);
        return ResponseEntity.ok(createdSpeaker);
    }

    // Endpoint pour mettre à jour un utilisateur par ID
    @PutMapping("/{id}")
    public ResponseEntity<Utilisateur> updateUser(@PathVariable Long id, @RequestBody UtilisateurRequest utilisateur) {
        // You should call a service method that handles the update logic
        Utilisateur updatedUtilisateur = utilisateurService.updateUser(id, utilisateur);

        if (updatedUtilisateur != null) {
            return ResponseEntity.ok(updatedUtilisateur);
        } else {
            return ResponseEntity.notFound().build();  // Return 404 if user not found
        }
    }


    // Endpoint pour supprimer un utilisateur par ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        utilisateurService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
