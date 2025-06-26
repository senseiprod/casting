package com.example.senseiVoix.controllers;

import com.example.senseiVoix.dtos.client.ClientRequest;
import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.entities.VerificationToken;
import com.example.senseiVoix.enumeration.RoleUtilisateur;
import com.example.senseiVoix.repositories.ClientRepository;
import com.example.senseiVoix.repositories.VerificationTokenRepository;
import com.example.senseiVoix.services.EmailService2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private VerificationTokenRepository tokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService2 emailService2;
    @Autowired
    private AuthenticationManager authenticationManager;

    @GetMapping("/auth/choose")
    public String chooseAuthMethod() {
        return "auth-choose"; // This should be a Thymeleaf template (auth-choose.html) inside 'src/main/resources/templates'
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestParam String email, @RequestParam String motDePasse) {
        Client client = clientRepository.findByEmail(email);

        if (client == null || !passwordEncoder.matches(motDePasse, client.getMotDePasse())) {
            return ResponseEntity.ok(Map.of("message", "Invalid email or password"));
        }

        // Create an authentication token for the session
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, motDePasse)
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        return ResponseEntity.ok(Map.of("message", "Login successful!"));

    }

    @PostMapping("/signup")
    public ResponseEntity<String> registerClient(@RequestBody ClientRequest clientRequest) {

        Client client = new Client();
        client.setNom(clientRequest.getNom());
        client.setPrenom(clientRequest.getPrenom());
        client.setEmail(clientRequest.getEmail());
        client.setMotDePasse(passwordEncoder.encode(clientRequest.getMotDePasse())); // Encode password
        client.setVerified(false); // Set as unverified
        client.setRole(RoleUtilisateur.SPEAKER); // Assign role

        // Save client entity
        client = clientRepository.save(client);

        // Generate verification token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(client); // Associate token with client
        verificationToken.setExpiryDate(LocalDateTime.now().plusMinutes(30));

        // Save verification token
        tokenRepository.save(verificationToken);

        // Send verification email
        emailService2.sendVerificationEmail(client.getEmail(), token);

        return ResponseEntity.ok("Client registered! Please check your email for verification.");
    }

    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token);

        if (verificationToken == null || verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Invalid or expired token.");
        }

        Client client = (Client) verificationToken.getUser();  // Cast to Client
        client.setVerified(true);
        clientRepository.save(client);
        tokenRepository.delete(verificationToken);

        return ResponseEntity.ok("Email verified successfully!");
    }

    // New endpoint for OAuth2-based registration
    @PostMapping("/oauth2-signup")
    public ResponseEntity<String> registerOAuth2Client(@RequestBody Client client) {
        // Ensure OAuth2 user does not already exist
        if (clientRepository.existsByEmail((client.getEmail()))) {
            return ResponseEntity.badRequest().body("OAuth2 user already exists!");
        }

        // Save the client as a new user
        client.setRole(RoleUtilisateur.SPEAKER);  // Set role to CLIENT
        client.setBalance(0.0);  // Optionally initialize the balance
        clientRepository.save(client);

        // Generate a verification token
        String token = UUID.randomUUID().toString();
        // Create and associate the verification token
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(client);  // Associate token with the client
        verificationToken.setExpiryDate(LocalDateTime.now().plusMinutes(30));  // Expiry time of the token
        tokenRepository.save(verificationToken);

        // Send the email with the verification link
        emailService2.sendVerificationEmail(client.getEmail(), token);

        return ResponseEntity.ok("OAuth2 Client registered! Please check your email for verification.");
    }
}
