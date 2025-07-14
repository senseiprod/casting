package com.example.senseiVoix.controllers;


import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.repositories.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/debug")
public class DebugController {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @GetMapping("/find-user/{email}")
    public ResponseEntity<Map<String, Object>> findUserByEmail(@PathVariable String email) {
        System.out.println("--- DEBUG ENDPOINT: Searching for user: " + email);

        Optional<Utilisateur> userOptional = utilisateurRepository.findByEmail(email);

        Map<String, Object> response = new HashMap<>();

        if (userOptional.isPresent()) {
            Utilisateur foundUser = userOptional.get();
            response.put("status", "FOUND");
            response.put("email", foundUser.getEmail());
            response.put("id", foundUser.getId());
            response.put("provider", foundUser.getProvider());
            response.put("role", foundUser.getRole() != null ? foundUser.getRole().name() : null);
            System.out.println("--- DEBUG ENDPOINT: Found user with provider: " + foundUser.getProvider());
        } else {
            response.put("status", "NOT_FOUND");
            response.put("email", email);
            System.out.println("--- DEBUG ENDPOINT: User not found.");
        }

        return ResponseEntity.ok(response);
    }
}