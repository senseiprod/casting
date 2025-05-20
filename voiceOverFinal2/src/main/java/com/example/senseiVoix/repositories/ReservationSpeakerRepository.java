package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.ReservationSpeaker;
import com.example.senseiVoix.entities.Speaker;
import com.example.senseiVoix.entities.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ReservationSpeakerRepository extends JpaRepository<ReservationSpeaker, Long> {

    List<ReservationSpeaker> findByUser(Utilisateur user);

    List<ReservationSpeaker> findBySpeaker(Speaker speaker);

    List<ReservationSpeaker> findByDate(LocalDate date);

    List<ReservationSpeaker> findByUserAndDate(Utilisateur user, LocalDate date);

    List<ReservationSpeaker> findBySpeakerAndDate(Speaker speaker, LocalDate date);
}
