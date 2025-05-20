package com.example.senseiVoix.config;

import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.repositories.UtilisateurRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {

    private final UtilisateurRepository utilisateurRepository; // Assuming you have a repository to fetch users

    public CustomUserDetailsService(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        return User.builder()
                .username(utilisateur.getUsername())
                .password(utilisateur.getMotDePasse())
                .roles(String.valueOf(utilisateur.getRole()))
                .build();
    }


}
