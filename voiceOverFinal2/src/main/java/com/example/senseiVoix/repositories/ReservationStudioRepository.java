package com.example.senseiVoix.repositories;

import com.example.senseiVoix.entities.ReservationStudio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservationStudioRepository extends JpaRepository<ReservationStudio, Long> {

    // 1. Toutes les réservations d'une date
    @Query("SELECT r FROM ReservationStudio r WHERE r.date = :date")
    List<ReservationStudio> findByDate(@Param("date") LocalDate date);

    // 2. Réservations pour une date donnée ET entre deux heures
    @Query("SELECT r FROM ReservationStudio r WHERE r.date = :date AND r.heureDebut >= :startTime AND r.heureFin <= :endTime")
    List<ReservationStudio> findByDateAndTimeRange(
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );

    // 3. Réservations sur une plage de dates
    @Query("SELECT r FROM ReservationStudio r WHERE r.date BETWEEN :startDate AND :endDate")
    List<ReservationStudio> findByDateRange(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    // 4. Heures réservées pour une date donnée
    @Query("SELECT r.heureDebut FROM ReservationStudio r WHERE r.date = :date")
    List<LocalTime> findReservedHoursByDate(@Param("date") LocalDate date);

    // 5. (Optionnel) Si tu veux aller plus loin :
    // Suppose que tu as une table fixe d'heures possibles (par exemple "heure_slots" avec des LocalTime)
    // Tu peux faire une native query comme ceci :

    // @Query(value = """
    // SELECT h.slot FROM heure_slots h
    // WHERE h.slot NOT IN (
    //     SELECT r.heure_debut FROM reservation_studio r WHERE r.date = :date
    // )
    // """, nativeQuery = true)
    // List<LocalTime> findNonReservedHoursByDate(@Param("date") LocalDate date);
}
