package com.example.senseiVoix.entities;

import com.example.senseiVoix.config.AuthorityDeserializer;
import com.example.senseiVoix.entities.token.Token;
import com.example.senseiVoix.enumeration.RoleUtilisateur;
import com.fasterxml.jackson.annotation.JsonIgnore;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "dtype", discriminatorType = DiscriminatorType.STRING)
@Builder
public class Utilisateur extends BaseModel implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "id", nullable = false)
    private Long id;

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public List<Demande> getDemandes() {
        return demandes;
    }

    public void setDemandes(List<Demande> demandes) {
        this.demandes = demandes;
    }

    public List<Action> getActions() {
        return actions;
    }

    public void setActions(List<Action> actions) {
        this.actions = actions;
    }

    public List<Record> getRecords() {
        return records;
    }

    public void setRecords(List<Record> records) {
        this.records = records;
    }

    public byte[] getPhoto() {
        return photo;
    }

    public void setPhoto(byte[] photo) {
        this.photo = photo;
    }

    private String nom;
    private String prenom;

    // @Column(unique = true)
    private String email;
    private String motDePasse;
    private String phone;
    private String companyName;

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    // OAuth2 provider details
    private String provider;
    private String providerId;

    private boolean verified = false;

    @OneToMany(mappedBy = "user")
    @JsonManagedReference
    private List<Token> tokens;

    @Override
    @JsonDeserialize(using = AuthorityDeserializer.class)
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return role.getAuthorities();
    }

    @Override
    public String getPassword() {
        return this.motDePasse;
    }

    public Integer getId() {
        return Math.toIntExact(id);
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getMotDePasse() {
        return motDePasse;
    }

    public void setMotDePasse(String motDePasse) {
        this.motDePasse = motDePasse;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
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

    private String username;

    @Enumerated(EnumType.STRING)
    private RoleUtilisateur role;

    @JsonIgnore
    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL)
    private List<Demande> demandes;
    @JsonIgnore
    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL)
    private List<Action> actions;
    @JsonIgnore
    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL)
    private List<Record> records;

    @Column(columnDefinition = "BYTEA")
    private byte[] photo;
    @JsonIgnore
    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL)
    private List<Payment> payments;
    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Project> projects;
    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<FavoriteVoices> favoriteVoices;
    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<ReservationStudio> reservationStudios;
    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<ReservationSpeaker> reservationSpeakers;


    private Double percentage;


    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

}
