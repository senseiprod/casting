package com.example.senseiVoix.controllers;
import com.example.senseiVoix.dtos.reservation.ReservationRequest;
import com.example.senseiVoix.dtos.reservation.ReservationResponse;
import com.example.senseiVoix.services.serviceImp.ReservationStudioService;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationStudioController {

    private final ReservationStudioService reservationService;

    // ✅ Créer une réservation
    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(@RequestBody ReservationRequest request) {
        ReservationResponse response = reservationService.saveReservation(request);
        return ResponseEntity.ok(response);
    }

    // ✅ Récupérer toutes les réservations pour une date donnée
    @GetMapping("/by-date")
    public ResponseEntity<List<ReservationResponse>> getByDate(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reservationService.getReservationsByDate(date));
    }

    // ✅ Récupérer les réservations d'une date entre deux heures
    @GetMapping("/by-date-and-range")
    public ResponseEntity<List<ReservationResponse>> getByDateAndRange(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime end) {
        return ResponseEntity.ok(reservationService.getReservationsByDateAndTimeRange(date, start, end));
    }

    // ✅ Récupérer les réservations sur une plage de dates
    @GetMapping("/by-date-range")
    public ResponseEntity<List<ReservationResponse>> getByDateRange(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reservationService.getReservationsByDateRange(startDate, endDate));
    }

    // ✅ Récupérer les heures réservées pour une date donnée
    @GetMapping("/reserved-hours")
    public ResponseEntity<List<LocalTime>> getReservedHours(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reservationService.getReservedHoursByDate(date));
    }
}

