package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.Demande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DemandeRepository extends JpaRepository<Demande, Long> {
    @Query("select d from Demande d where d.utilisateur.uuid =:uuid")
    List<Demande> findByDemandeurUuid(@Param("uuid") String uuid);
    @Query("select d from Demande d where d.statut = com.example.senseiVoix.enumeration.StatutDemande.EN_ATTENTE")
    List<Demande> findEnAttente();
    
    @Query("select d from Demande d where d.statut = com.example.senseiVoix.enumeration.StatutDemande.ACCEPTEE")
    List<Demande> findAcceptees();
    
    @Query("select d from Demande d where d.statut = com.example.senseiVoix.enumeration.StatutDemande.REJETEE")
    List<Demande> findRefusees();
    
    @Query("SELECT COUNT(d) FROM Demande d WHERE d.statut = com.example.senseiVoix.enumeration.StatutDemande.EN_ATTENTE")
    Long countEnAttente();
    
    @Query("SELECT COUNT(d) FROM Demande d WHERE d.statut = com.example.senseiVoix.enumeration.StatutDemande.ACCEPTEE")
    Long countAcceptees();
    
    @Query("SELECT COUNT(d) FROM Demande d WHERE d.statut = com.example.senseiVoix.enumeration.StatutDemande.REJETEE")
    Long countRefusees();
    @Query("select d from Demande d where d.uuid =:uuid")
    Demande findByUuid(@Param("uuid") String uuid);
    @Query("select d from Demande d where d.deleted = false ")
    List<Demande> findAllByDeletedFalse();
    @Query("select d from Demande d where d.deleted = true ")
    List<Demande> findAllByDeletedTrue();
    
}
