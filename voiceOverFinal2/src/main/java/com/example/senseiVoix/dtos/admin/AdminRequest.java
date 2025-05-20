package com.example.senseiVoix.dtos.admin;

import com.example.senseiVoix.entities.Admin;
import com.example.senseiVoix.enumeration.RoleAdmin;
import com.example.senseiVoix.enumeration.RoleUtilisateur;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * DTO for {@link Admin}
 */
@NoArgsConstructor
@AllArgsConstructor
public class AdminRequest implements Serializable {
    String nom;
    String prenom;

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

    public RoleAdmin getRoleAdmin() {
        return roleAdmin;
    }

    String email;
    String motDePasse;
    String phone;
    String username;
    RoleUtilisateur role;
    RoleAdmin roleAdmin;
}
