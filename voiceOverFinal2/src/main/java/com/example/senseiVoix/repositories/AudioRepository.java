package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.Audio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AudioRepository extends JpaRepository<Audio, Long> {
     @Query("SELECT a FROM Audio a WHERE a.speaker.uuid = :speakerId")
    List<Audio> findBySpeakerId(@Param("speakerId")String speakerId);
}
