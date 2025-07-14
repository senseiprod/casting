package com.example.senseiVoix.controllers.auth;

import com.example.senseiVoix.config.JwtService;
import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.entities.token.Token;
import com.example.senseiVoix.entities.token.PasswordResetToken;
import com.example.senseiVoix.repositories.TokenRepository;
import com.example.senseiVoix.repositories.PasswordResetTokenRepository;
import com.example.senseiVoix.entities.token.TokenType;
import com.example.senseiVoix.enumeration.RoleUtilisateur;
import com.example.senseiVoix.repositories.UtilisateurRepository;
import com.example.senseiVoix.services.serviceImp.EmailService;
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
  private final PasswordResetTokenRepository passwordResetTokenRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final AuthenticationManager authenticationManager;
  private final EmailService emailService;

  @Autowired
  public AuthenticationService(UtilisateurRepository repository, TokenRepository tokenRepository,
      PasswordResetTokenRepository passwordResetTokenRepository, PasswordEncoder passwordEncoder, 
      JwtService jwtService, AuthenticationManager authenticationManager, EmailService emailService) {
    this.repository = repository;
    this.tokenRepository = tokenRepository;
    this.passwordResetTokenRepository = passwordResetTokenRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.authenticationManager = authenticationManager;
    this.emailService = emailService;
  }

  public AuthenticationResponse register(RegisterRequest request) {
    var user = new Client();
    user.setPrenom(request.getFirstname());
    user.setNom(request.getLastname());
    user.setEmail(request.getEmail());
    user.setCompanyName(request.getCompanyName());
    user.setPhone(request.getPhone());
    user.setMotDePasse(passwordEncoder.encode(request.getPassword()));
    user.setRole(RoleUtilisateur.CLIENT);

    var savedUser = repository.save(user);
    var jwtToken = jwtService.generateToken(user);
    var refreshToken = jwtService.generateRefreshToken(user);
    saveUserToken(savedUser, jwtToken);
    return new AuthenticationResponse(jwtToken, refreshToken, user.getUuid());
  }

  public AuthenticationResponse registerSpeaker(RegisterRequest request) {
    var user = new Client();
    user.setPrenom(request.getFirstname());
    user.setNom(request.getLastname());
    user.setEmail(request.getEmail());
    user.setCompanyName(request.getCompanyName());
    user.setPhone(request.getPhone());
    user.setMotDePasse(passwordEncoder.encode(request.getPassword()));
    user.setRole(RoleUtilisateur.SPEAKER);

    var savedUser = repository.save(user);
    var jwtToken = jwtService.generateToken(user);
    var refreshToken = jwtService.generateRefreshToken(user);
    saveUserToken(savedUser, jwtToken);
    return new AuthenticationResponse(jwtToken, refreshToken, user.getUuid());
  }

  public AuthenticationResponse registerAdmin(RegisterRequest request) {
    var user = new Client();
    user.setPrenom(request.getFirstname());
    user.setNom(request.getLastname());
    user.setEmail(request.getEmail());
    user.setCompanyName(request.getCompanyName());
    user.setPhone(request.getPhone());
    user.setMotDePasse(passwordEncoder.encode(request.getPassword()));
    user.setRole(RoleUtilisateur.ADMIN);

    var savedUser = repository.save(user);
    var jwtToken = jwtService.generateToken(user);
    var refreshToken = jwtService.generateRefreshToken(user);
    saveUserToken(savedUser, jwtToken);
    return new AuthenticationResponse(jwtToken, refreshToken, user.getUuid());
  }

  public AuthenticationResponse authenticate(AuthenticationRequest request) {
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            request.getEmail(),
            request.getPassword()));
    var user = repository.findByEmail(request.getEmail())
        .orElseThrow();
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

  @Transactional
  public void forgotPassword(String email) {
      var userOptional = repository.findByEmail(email);
      
      if (userOptional.isEmpty()) {
          // Don't reveal that email doesn't exist for security reasons
          return;
      }
      
      Utilisateur user = userOptional.get();
      
      // Delete any existing password reset tokens for this user
      passwordResetTokenRepository.deleteByUser(user);
      
      // Generate a unique token
      String token = UUID.randomUUID().toString();
      
      // Set expiry time (1 hour from now)
      LocalDateTime expiryDate = LocalDateTime.now().plusHours(1);
      
      // Create and save the password reset token
      PasswordResetToken resetToken = new PasswordResetToken(token, user, expiryDate);
      passwordResetTokenRepository.save(resetToken);
      
      // Send email with reset link
      emailService.sendPasswordResetEmail(user.getEmail(), token);
  }

  @Transactional
  public void resetPassword(String token, String newPassword) {
      PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
          .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset token"));
      
      if (resetToken.isUsed()) {
          throw new IllegalArgumentException("Password reset token has already been used");
      }
      
      if (resetToken.isExpired()) {
          throw new IllegalArgumentException("Password reset token has expired");
      }
      
      Utilisateur user = resetToken.getUser();
      
      // Update user's password
      user.setMotDePasse(passwordEncoder.encode(newPassword));
      repository.save(user);
      
      // Mark token as used
      resetToken.setUsed(true);
      passwordResetTokenRepository.save(resetToken);
      
      // Revoke all existing JWT tokens for security
      revokeAllUserTokens(user);
  }

  // Cleanup method to remove expired tokens (can be called by a scheduled task)
  @Transactional
  public void cleanupExpiredPasswordResetTokens() {
      passwordResetTokenRepository.deleteExpiredTokens(LocalDateTime.now());
  }
}
