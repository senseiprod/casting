package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.SpeakerInfo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpeakerInfoRepository extends JpaRepository<SpeakerInfo, Long> {

    boolean existsByEmail(String email);
}
