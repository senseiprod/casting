package com.example.senseiVoix.dtos.client;

import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.enumeration.RoleUtilisateur;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * DTO for {@link Client}
 */
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ClientRequest implements Serializable {
    String nom;
    String prenom;
    String email;
    String motDePasse;
    boolean verified;

    public String getNom() {
        return nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public String getEmail() {
        return email;
    }

    public String getMotDePasse() {
        return motDePasse;
    }

    public String getPhone() {
        return phone;
    }

    public String getUsername() {
        return username;
    }

    public RoleUtilisateur getRole() {
        return role;
    }

    public double getBalance() {
        return balance;
    }

    public double getFidilite() {
        return fidilite;
    }

    String phone;
    String username;
    RoleUtilisateur role;
    double balance;
    double fidilite;
}
