package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.Client;
import com.example.senseiVoix.enumeration.RoleUtilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClientRepository extends JpaRepository<Client, Long> {
    @Query("SELECT c FROM Client  c WHERE c.uuid =:uuid AND c.deleted =false")
    Client findByUuid(@Param("uuid") String clientId);
    @Query("SELECT c FROM Client  c WHERE c.email =:email AND c.deleted =false")
    Client findByEmail(@Param("email") String clientEmail);
    @Query("SELECT c FROM Client  c WHERE c.fidilite =:fidilite AND c.deleted =false")
    Client findByfidelite(@Param("fidilite") String clientEmail);
    @Query("SELECT c FROM Client  c WHERE c.deleted =false ")
    List<Client> findAllNotDeleted();
    @Query("SELECT c FROM Client  c WHERE c.deleted =true ")
    List<Client> findAllDeleted();

    boolean existsByEmail(String email);

    boolean existsByRole(RoleUtilisateur role);
}
