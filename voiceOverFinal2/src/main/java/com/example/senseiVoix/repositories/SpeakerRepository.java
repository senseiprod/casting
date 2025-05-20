package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.Speaker;
import com.example.senseiVoix.entities.Voix;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SpeakerRepository extends JpaRepository<Speaker, Long> {
    @Query("SELECT c FROM Speaker  c WHERE c.uuid =:uuid AND c.deleted =false")
    Speaker findByUuid(@Param("uuid") String clientId);
    @Query("SELECT c FROM Speaker  c WHERE c.email =:email AND c.deleted =false")
    Speaker findByEmail(@Param("email") String clientEmail);
    @Query("SELECT c FROM Speaker  c WHERE c.earnings =:earnings AND c.deleted =false")
    List<Speaker> findBysalair(@Param("earnings") Double earnings);
    @Query("SELECT c FROM Speaker  c WHERE c.deleted =false ")
    List<Speaker> findAllNotDeleted();
    @Query("SELECT c FROM Speaker  c WHERE c.deleted =true ")
    List<Speaker> findAllDeleted();
    @Query("SELECT s FROM Speaker s WHERE LOWER(s.nom) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(s.prenom) LIKE LOWER(CONCAT('%', :name, '%')) AND s.deleted = false")
    List<Speaker> findByFirstNameOrLastName(@Param("name") String name);


    Speaker getSpeakerByVoix(Voix voix);
}
