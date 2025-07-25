package com.example.senseiVoix.dtos.utilisateur;

import com.example.senseiVoix.enumeration.RoleUtilisateur;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UtilisateurRequest {

    private String code;
    private Boolean deleted;
    private Long id;
    private String nom;            // Name
    private String prenom;         // Surname
    private String email;
    private String motDePasse;     // Password
    private String phone;
    private Boolean verified;
    private RoleUtilisateur role;
    private byte[] photo;
    private Double balance;        // Not in original, but requested
    private Integer fidelity;      // Not in original, but requested
    private Double percentage;
    private Integer free_test;

}
