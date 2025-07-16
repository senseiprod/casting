package com.example.senseiVoix.dtos.utilisateur;
import com.example.senseiVoix.enumeration.RoleUtilisateur;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * DTO for {@link Utilisateur}
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UtilisateurResponse  {
    String uuid;
    String code;
    private String nom;
    private String prenom;

    private String email;

    private String phone;

    private String username;

    private RoleUtilisateur role;
    private Double percentage;


}
