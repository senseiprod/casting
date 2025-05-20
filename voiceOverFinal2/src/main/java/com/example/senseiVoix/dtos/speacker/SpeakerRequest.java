package com.example.senseiVoix.dtos.speacker;

import com.example.senseiVoix.entities.Speaker;
import com.example.senseiVoix.enumeration.RoleUtilisateur;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * DTO for {@link Speaker}
 */
@NoArgsConstructor
@AllArgsConstructor
public class SpeakerRequest implements Serializable {
    String nom;
    String prenom;
    String email;

    public String getBanckRib() {
        return banckRib;
    }

    String banckRib;

    public Integer getAge() {
        return age;
    }

    public String getGender() {
        return gender;
    }

    Integer age ;
    String gender ;

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

    public double getEarnings() {
        return earnings;
    }

    String motDePasse;
    String phone;
    String username;
    RoleUtilisateur role;
    double earnings;
}
