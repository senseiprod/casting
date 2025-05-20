package com.example.senseiVoix.dtos.client;

import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.enumeration.RoleUtilisateur;
import lombok.Value;

import java.io.Serializable;

/**
 * DTO for {@link Client}
 */
@Value
public class ClientResponse implements Serializable {
    String uuid;
    String code;
    String nom;

    public ClientResponse(String uuid, String code, String nom, String prenom, String email, String motDePasse, String phone, String username, RoleUtilisateur role, double balance, double fidilite) {
        this.uuid = uuid;
        this.code = code;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.motDePasse = motDePasse;
        this.phone = phone;
        this.username = username;
        this.role = role;
        this.balance = balance;
        this.fidilite = fidilite;
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

    String prenom;
    String email;
    String motDePasse;
    String phone;
    String username;
    RoleUtilisateur role;
    double balance;
    double fidilite;
}
