package com.example.senseiVoix.dtos.admin;

import com.example.senseiVoix.entities.Admin;
import com.example.senseiVoix.enumeration.RoleAdmin;
import com.example.senseiVoix.enumeration.RoleUtilisateur;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * DTO for {@link Admin}
 */
@NoArgsConstructor

public class AdminResponse implements Serializable {
    String uuid;
    String code;
    String nom;
    String prenom ;

    public AdminResponse(String uuid, String code, String nom, String prenom, String email, String motDePasse, String phone, String username, RoleUtilisateur role, RoleAdmin roleAdmin) {
        this.uuid = uuid;
        this.code = code;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.motDePasse = motDePasse;
        this.phone = phone;
        this.username = username;
        this.role = role;
        this.roleAdmin = roleAdmin;
    }

    public String getUuid() {
        return uuid;
    }

    public String getCode() {
        return code;
    }

    public String getNom() {
        return nom;
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
