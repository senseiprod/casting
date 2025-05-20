package com.example.senseiVoix.config;

import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.enumeration.RoleUtilisateur;
import com.example.senseiVoix.repositories.ClientRepository;
import com.example.senseiVoix.repositories.UtilisateurRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UtilisateurRepository utilisateurRepository;
    private final ClientRepository clientRepository;

    public CustomOAuth2UserService(UtilisateurRepository utilisateurRepository, ClientRepository clientRepository) {
        this.utilisateurRepository = utilisateurRepository;
        this.clientRepository = clientRepository;
    }

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // Extract email and name from OAuth2 response
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String username = oAuth2User.getAttribute("username");

        // Log OAuth2 user details
        System.out.println("OAuth2 User Details: Email - " + email + ", Name - " + name);



        // Check if user already exists
        Optional<Utilisateur> existingUser = utilisateurRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            return oAuth2User;
        }

        // Create a new Client user
        Client client = new Client();
        client.setEmail(email);
        client.setNom(name);
        client.setProvider(userRequest.getClientRegistration().getRegistrationId());
        client.setProviderId(oAuth2User.getAttribute("sub"));
        client.setRole(RoleUtilisateur.SPEAKER);
        client.setBalance(0.0);
        client.setUsername(username);

        // Save the new Client
        clientRepository.save(client);

        return oAuth2User;
    }

}
