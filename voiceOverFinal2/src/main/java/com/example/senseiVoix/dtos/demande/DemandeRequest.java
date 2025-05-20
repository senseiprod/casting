package com.example.senseiVoix.dtos.demande;

import com.example.senseiVoix.entities.Demande;
import lombok.*;

/**
 * DTO for {@link Demande}
 */
@Data
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DemandeRequest {
    String titre;
    String description;

    // Change from Facture object to Long factureId
    private Long factureId;

    public String getTitre() {
        return titre;
    }

    public String getDescription() {
        return description;
    }

    public String getType() {
        return type;
    }

    String utilisateurUuid;
    String type;

    public String getUtilisateurUuid() {
        return utilisateurUuid;
    }
}
