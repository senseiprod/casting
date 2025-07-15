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

    private static final Logger logger = LoggerFactory.getLogger(OAuth2Service.class);

    @Transactional
    public AuthenticationResponse processOAuth2User(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        if (email == null || email.isEmpty()) {
            throw new InternalAuthenticationServiceException("Critical: Email not found from OAuth2 provider.");
        }

        logger.info("--- [OAuth2 Start] Processing login for email: {}", email);

        Optional<Utilisateur> userOptional = utilisateurRepository.findByEmail(email);
        Utilisateur user;

        // ============================ CHANGE START ============================
        // This entire logic block is rewritten for clarity and to handle account linking.

        if (userOptional.isPresent()) {
            // --- PATH A: USER ALREADY EXISTS ---
            Utilisateur existingUser = userOptional.get();
            String existingProviderStr = existingUser.getProvider();
            logger.warn("[OAuth2 Decision] User with email {} already exists. Database provider is: '{}'", email, existingProviderStr);

            // SCENARIO 1: The user is a returning Google user. This is a normal login.
            if (AuthProvider.GOOGLE.name().equals(existingProviderStr)) {
                logger.info("[OAuth2 Path] SUCCESS: Existing user is a returning Google user. Updating details.");
                user = updateExistingGoogleUser(existingUser, oAuth2User);

                // SCENARIO 2: The user exists but registered locally (provider is LOCAL or null). We link the account.
            } else if (existingProviderStr == null || AuthProvider.LOCAL.name().equals(existingProviderStr)) {
                logger.info("[OAuth2 Path] LINKING: Existing local user is signing in with Google. Linking account.");
                user = linkLocalUserToGoogle(existingUser, oAuth2User);

                // SCENARIO 3: The user exists but with a DIFFERENT OAuth provider (e.g., Facebook). This is a conflict.
            } else {
                logger.error("[OAuth2 Path] FAILURE: User already exists with provider '{}'. Cannot link to GOOGLE.", existingProviderStr);
                throw new InternalAuthenticationServiceException(
                        "This email is already linked to a " + existingProviderStr + " account. Please log in using that method."
                );
            }
        } else {
            // --- PATH B: USER DOES NOT EXIST ---
            // This is a new user signing up for the first time with Google.
            logger.info("[OAuth2 Decision] User with email {} does not exist. Creating a new Google user.", email);
            user = registerNewGoogleUser(oAuth2User);
        }
        // ============================= CHANGE END =============================


        logger.info("[OAuth2 Finish] Authentication successful for user ID {}. Generating JWTs.", user.getId());
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, jwtToken);

        return new AuthenticationResponse(jwtToken, refreshToken, user.getUuid());
    }

    // Renamed for clarity: this is specifically for NEW Google users
    private Utilisateur registerNewGoogleUser(OAuth2User oAuth2User) {
        Client user = new Client();
        user.setProvider(AuthProvider.GOOGLE.name()); // Use the enum
        user.setRole(RoleUtilisateur.CLIENT);
        user.setEmail(oAuth2User.getAttribute("email"));
        user.setPrenom(oAuth2User.getAttribute("given_name"));
        user.setNom(oAuth2User.getAttribute("family_name"));
        user.setVerified(true); // Email from OAuth provider is considered verified
        logger.info("Saving new GOOGLE user '{}' to the database.", user.getEmail());
        return utilisateurRepository.save(user);
    }

    // Renamed for clarity: this is for UPDATING EXISTING Google users
    private Utilisateur updateExistingGoogleUser(Utilisateur existingUser, OAuth2User oAuth2User) {
        // You might want to update profile picture, name, etc., on subsequent logins
        existingUser.setPrenom(oAuth2User.getAttribute("given_name"));
        existingUser.setNom(oAuth2User.getAttribute("family_name"));
        logger.info("Updating existing GOOGLE user '{}' in the database.", existingUser.getEmail());
        return utilisateurRepository.save(existingUser);
    }

    // ============================ NEW METHOD ============================
    // This new method handles the logic for linking a local account to Google
    private Utilisateur linkLocalUserToGoogle(Utilisateur existingUser, OAuth2User oAuth2User) {
        logger.info("Updating local user '{}' to link with GOOGLE.", existingUser.getEmail());
        // Set the provider to GOOGLE
        existingUser.setProvider(AuthProvider.GOOGLE.name());
        // The email is verified by Google, so we can mark it as such
        existingUser.setVerified(true);
        // Update user's name from Google profile if they were not set during local registration
        if (existingUser.getPrenom() == null || existingUser.getPrenom().isEmpty()) {
            existingUser.setPrenom(oAuth2User.getAttribute("given_name"));
        }
        if (existingUser.getNom() == null || existingUser.getNom().isEmpty()) {
            existingUser.setNom(oAuth2User.getAttribute("family_name"));
        }
        // The user now has no password, as they will use Google to log in.
        // You may want to nullify the password field for security.
        existingUser.setMotDePasse(null);

        return utilisateurRepository.save(existingUser);
    }
    // ============================ END NEW METHOD ============================


    private void saveUserToken(Utilisateur user, String jwtToken) {
        var token = Token.builder()
                .user(user)
                .token(jwtToken)
                .tokenType(TokenType.BEARER)
                .expired(false)
                .revoked(false)
                .build();
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