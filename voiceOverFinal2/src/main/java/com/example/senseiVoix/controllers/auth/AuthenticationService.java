package com.example.senseiVoix.controllers.auth;

import com.example.senseiVoix.config.JwtService;
import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.entities.VerificationToken;
import com.example.senseiVoix.entities.token.Token;
import com.example.senseiVoix.repositories.TokenRepository;
import com.example.senseiVoix.entities.token.TokenType;
import com.example.senseiVoix.enumeration.RoleUtilisateur;
import com.example.senseiVoix.repositories.UtilisateurRepository;
import com.example.senseiVoix.repositories.VerificationTokenRepository;
import com.example.senseiVoix.services.EmailService2;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthenticationService {
  private final UtilisateurRepository repository;
  private final TokenRepository tokenRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final AuthenticationManager authenticationManager;
  private final VerificationTokenRepository verificationTokenRepository;
  private final EmailService2 emailService;

  @Autowired
  public AuthenticationService(UtilisateurRepository repository, TokenRepository tokenRepository,
                               PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager,
                               VerificationTokenRepository verificationTokenRepository, EmailService2 emailService) {
    this.repository = repository;
    this.tokenRepository = tokenRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.authenticationManager = authenticationManager;
    this.verificationTokenRepository = verificationTokenRepository;
    this.emailService = emailService;
  }

  private void registerAndSendVerificationEmail(RegisterRequest request, RoleUtilisateur role) {
    repository.findByEmail(request.getEmail()).ifPresent(u -> {
      throw new IllegalStateException("Email already in use. Please use a different email or log in.");
    });

    var user = new Client();
    user.setPrenom(request.getFirstname());
    user.setNom(request.getLastname());
    user.setEmail(request.getEmail());
    user.setCompanyName(request.getCompanyName());
    user.setPhone(request.getPhone());
    user.setMotDePasse(passwordEncoder.encode(request.getPassword()));
    user.setRole(role);
    user.setVerified(false); // User is not verified upon registration

    var savedUser = repository.save(user);

    String token = UUID.randomUUID().toString();
    VerificationToken verificationToken = new VerificationToken();
    verificationToken.setToken(token);
    verificationToken.setUser(savedUser);
    verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24)); // Token expires in 24 hours
    verificationTokenRepository.save(verificationToken);

    emailService.sendVerificationEmail(savedUser.getEmail(), token);
  }

  public void register(RegisterRequest request) {
    registerAndSendVerificationEmail(request, RoleUtilisateur.CLIENT);
  }

  public void registerSpeaker(RegisterRequest request) {
    registerAndSendVerificationEmail(request, RoleUtilisateur.SPEAKER);
  }

  public void registerAdmin(RegisterRequest request) {
    registerAndSendVerificationEmail(request, RoleUtilisateur.ADMIN);
  }

  @Transactional
  public void verifyUser(String token) {
    VerificationToken verificationToken = verificationTokenRepository.findByToken(token);
    if (verificationToken == null) {
      throw new IllegalArgumentException("Invalid verification token.");
    }
    if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
      verificationTokenRepository.delete(verificationToken);
      throw new IllegalArgumentException("Verification token has expired. Please register again.");
    }
    Utilisateur user = verificationToken.getUser();
    user.setVerified(true);
    repository.save(user);
    verificationTokenRepository.delete(verificationToken); // Token is used, so we delete it
  }

  public AuthenticationResponse authenticate(AuthenticationRequest request) {
    authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()));
    var user = repository.findByEmail(request.getEmail())
            .orElseThrow();

    if (!user.isVerified()) {
      throw new IllegalStateException("Account not verified. Please check your email for the verification link.");
    }

    var jwtToken = jwtService.generateToken(user);
    var refreshToken = jwtService.generateRefreshToken(user);
    revokeAllUserTokens(user);
    saveUserToken(user, jwtToken);
    return new AuthenticationResponse(jwtToken, refreshToken, user.getUuid());
  }

  private void saveUserToken(Utilisateur user, String jwtToken) {
    var token = new Token();
    token.setUser(user);
    token.setToken(jwtToken);
    token.setTokenType(TokenType.BEARER);
    token.setExpired(false);
    token.setRevoked(false);
    tokenRepository.save(token);
  }

  private void revokeAllUserTokens(Utilisateur user) {
    var validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
    if (validUserTokens.isEmpty())
      return;
    validUserTokens.forEach(token -> {
      token.setExpired(true);
      token.setRevoked(true);
    });
    tokenRepository.saveAll(validUserTokens);
  }

  public void refreshToken(
          HttpServletRequest request,
          HttpServletResponse response) throws IOException {
    final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
    final String refreshToken;
    final String userEmail;
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      return;
    }
    refreshToken = authHeader.substring(7);
    userEmail = jwtService.extractUsername(refreshToken);
    if (userEmail != null) {
      var user = this.repository.findByEmail(userEmail)
              .orElseThrow();
      if (jwtService.isTokenValid(refreshToken, user)) {
        var accessToken = jwtService.generateToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, accessToken);
        var authResponse = new AuthenticationResponse(accessToken, refreshToken, user.getUuid());
        new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
      }
    }
  }
  @Transactional
  public void changePassword(String email, String oldPassword, String newPassword) {
    Utilisateur user = repository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    if (user.getPassword() == null || user.getPassword().isEmpty()) {
      throw new IllegalStateException("No password is set for this account");
    }

    if (!passwordEncoder.matches(oldPassword, user.getMotDePasse())) {
      throw new IllegalArgumentException("Current password is incorrect");
    }

    user.setMotDePasse(passwordEncoder.encode(newPassword));
    repository.save(user);

    revokeAllUserTokens(user);
  }
}