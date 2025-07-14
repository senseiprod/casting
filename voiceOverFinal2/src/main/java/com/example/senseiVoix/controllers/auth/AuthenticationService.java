package com.example.senseiVoix.controllers.auth;

import com.example.senseiVoix.config.JwtService;
import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.entities.VerificationToken;
import com.example.senseiVoix.entities.token.Token;
import com.example.senseiVoix.entities.token.PasswordResetToken;
import com.example.senseiVoix.repositories.TokenRepository;
import com.example.senseiVoix.repositories.PasswordResetTokenRepository;
import com.example.senseiVoix.entities.token.TokenType;
import com.example.senseiVoix.enumeration.RoleUtilisateur;
import com.example.senseiVoix.repositories.UtilisateurRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.oauth2.sdk.Role;

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

  @Autowired
  public AuthenticationService(UtilisateurRepository repository, TokenRepository tokenRepository,
      PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager) {
    this.repository = repository;
    this.tokenRepository = tokenRepository;
    this.passwordResetTokenRepository = passwordResetTokenRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.authenticationManager = authenticationManager;
  }

  public AuthenticationResponse register(RegisterRequest request) {
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