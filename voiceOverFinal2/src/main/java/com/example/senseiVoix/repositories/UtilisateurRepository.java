package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.Utilisateur;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    @Query("select u from Utilisateur u where u.uuid =:uuid")
    Utilisateur findByUuid(@Param("uuid") String uuid);
    Optional<Utilisateur> findByEmail(String email);
    Utilisateur findById(long id);

}
