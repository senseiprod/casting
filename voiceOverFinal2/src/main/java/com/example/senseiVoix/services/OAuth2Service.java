package com.example.senseiVoix.services;

import com.example.senseiVoix.config.JwtService;
import com.example.senseiVoix.controllers.auth.AuthenticationResponse;
import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.entities.token.Token;
import com.example.senseiVoix.entities.token.TokenType;
import com.example.senseiVoix.enumeration.AuthProvider;
import com.example.senseiVoix.enumeration.RoleUtilisateur;
import com.example.senseiVoix.repositories.TokenRepository;
import com.example.senseiVoix.repositories.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OAuth2Service {

    private final UtilisateurRepository utilisateurRepository;
    private final TokenRepository tokenRepository;
    private final JwtService jwtService;

    // Logger instance to provide detailed output
    private static final Logger logger = LoggerFactory.getLogger(OAuth2Service.class);

    @Transactional
    public AuthenticationResponse processOAuth2User(OAuth2User oAuth2User) {
        // 1. Get email from Google's response
        String email = oAuth2User.getAttribute("email");
        if (email == null || email.isEmpty()) {
            throw new InternalAuthenticationServiceException("Critical: Email not found from OAuth2 provider.");
        }

        // Add a clear starting log message for each request
        logger.info("--- [OAuth2 Start] Processing login for email: {}", email);

        // 2. Check if a user with this email ALREADY exists in our database
        Optional<Utilisateur> userOptional = utilisateurRepository.findByEmail(email);

        Utilisateur user; // This will hold the user we will work with

        // 3. The CORE DECISION LOGIC BLOCK
        if (userOptional.isPresent()) {
            // --- PATH A: USER ALREADY EXISTS ---
            Utilisateur existingUser = userOptional.get();
            String existingProvider = existingUser.getProvider();
            logger.warn("[OAuth2 Decision] User with email {} already exists. Checking provider. Found provider: '{}'", email, existingProvider);

            // Check if the existing user is a Google user.
            if (AuthProvider.GOOGLE.name().equals(existingProvider)) {
                // This is a returning Google user. This is a SUCCESS path.
                logger.info("[OAuth2 Path] SUCCESS: Existing user is a Google user. Updating details.");
                user = updateExistingUser(existingUser, oAuth2User);
            } else {
                // This is a user who registered with email/password (or has a null provider). This is a FAILURE path.
                logger.error("[OAuth2 Path] FAILURE: Existing user is a LOCAL or UNKNOWN provider. This is a login conflict.");
                throw new InternalAuthenticationServiceException("This email is already associated with a different login method. Please log in with your password.");
            }
        } else {
            // --- PATH B: USER DOES NOT EXIST ---
            // This is a new user signing up for the first time with Google. This is a SUCCESS path.
            logger.info("[OAuth2 Decision] User with email {} does not exist. Creating a new Google user.", email);
            user = registerNewUser(oAuth2User);
        }

        // 4. If we haven't thrown an exception by now, the login is successful. Generate tokens.
        logger.info("[OAuth2 Finish] Authentication successful for user ID {}. Generating JWTs.", user.getId());
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, jwtToken);

        return new AuthenticationResponse(jwtToken, refreshToken, user.getUuid());
    }


    private Utilisateur registerNewUser(OAuth2User oAuth2User) {
        Client user = new Client();
        user.setProvider(String.valueOf(AuthProvider.GOOGLE));
        user.setRole(RoleUtilisateur.CLIENT);
        user.setEmail(oAuth2User.getAttribute("email"));
        user.setPrenom(oAuth2User.getAttribute("given_name"));
        user.setNom(oAuth2User.getAttribute("family_name"));
        user.setVerified(true);
        logger.info("Saving new user '{}' to the database.", user.getEmail());
        return utilisateurRepository.save(user);
    }

    private Utilisateur updateExistingUser(Utilisateur existingUser, OAuth2User oAuth2User) {
        existingUser.setPrenom(oAuth2User.getAttribute("given_name"));
        existingUser.setNom(oAuth2User.getAttribute("family_name"));
        logger.info("Updating existing user '{}' in the database.", existingUser.getEmail());
        return utilisateurRepository.save(existingUser);
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
}