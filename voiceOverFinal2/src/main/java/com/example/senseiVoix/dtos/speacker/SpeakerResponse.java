package com.example.senseiVoix.dtos.speacker;

import com.example.senseiVoix.dtos.utilisateur.UtilisateurResponse;
import com.example.senseiVoix.entities.Speaker;
import com.example.senseiVoix.enumeration.RoleUtilisateur;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for {@link Speaker}
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Setter
public class SpeakerResponse extends UtilisateurResponse {
    String uuid;
    String code;
    private String nom;
    private String prenom;
    private Integer age ;

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    private String gender ;
    public String getBanckRib() {
        return banckRib;
    }

    public void setBanckRib(String banckRib) {
        this.banckRib = banckRib;
    }

    private String banckRib;

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public RoleUtilisateur getRole() {
        return role;
    }

    public void setRole(RoleUtilisateur role) {
        this.role = role;
    }

    public double getEarnings() {
        return earnings;
    }

    public void setEarnings(double earnings) {
        this.earnings = earnings;
    }

    private String email;
    private String phone;

    private String username;

    private RoleUtilisateur role;

    private double earnings;

}
