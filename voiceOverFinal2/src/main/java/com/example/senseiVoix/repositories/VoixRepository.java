package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.Voix;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VoixRepository extends JpaRepository<Voix, Long> {
    @Query("SELECT c FROM Voix  c WHERE c.uuid =:uuid AND c.deleted =false")
    Voix findByUuid(@Param("uuid") String clientId);
    @Query("SELECT c FROM Voix  c WHERE c.speaker.uuid =:uuid AND c.deleted =false")
    List<Voix> findBySpeaker(@Param("uuid") String uuid);

    @Query("SELECT c FROM Voix  c WHERE c.deleted =false ")
    List<Voix> findAllNotDeleted();
    @Query("SELECT c FROM Voix  c WHERE c.deleted =true ")
    List<Voix> findAllDeleted();


}
