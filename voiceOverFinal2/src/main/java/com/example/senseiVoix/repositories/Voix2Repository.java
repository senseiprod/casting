package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.Voix2;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface Voix2Repository extends JpaRepository<Voix2, Long> {
    @Query("SELECT c FROM Voix2  c WHERE c.uuid =:uuid AND c.deleted =false")
    Voix2 findByUuid(@Param("uuid") String clientId);
    @Query("SELECT c FROM Voix2  c WHERE c.speaker.uuid =:uuid AND c.deleted =false")
    List<Voix2> findBySpeaker(@Param("uuid") String uuid);

    @Query("SELECT c FROM Voix2 c WHERE c.deleted =false ")
    List<Voix2> findAllNotDeleted();
    @Query("SELECT c FROM Voix2  c WHERE c.deleted =true ")
    List<Voix2> findAllDeleted();


    List<Voix2> getVoix2ById(Long id);
}
