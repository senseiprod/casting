package com.example.senseiVoix.controllers;

import com.example.senseiVoix.dtos.reservation.ReservationSpeakerDto;
import com.example.senseiVoix.dtos.reservation.ReservationSpeakerDtoResponse;
import com.example.senseiVoix.services.serviceImp.ReservationSpeakerService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reservationsSpeaker")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ReservationSpeakerController {
    @Autowired
    private  ReservationSpeakerService reservationService;

    // 🔹 Create
    @PostMapping
    public ReservationSpeakerDtoResponse create(@RequestBody ReservationSpeakerDto dto) {
        return reservationService.create(dto);
    }

    // 🔹 Read - All
    @GetMapping
    public List<ReservationSpeakerDtoResponse> findAll() {
        return reservationService.findAll();
    }

    // 🔹 Read - By ID
    @GetMapping("/{id}")
    public Optional<ReservationSpeakerDtoResponse> findById(@PathVariable Long id) {
        return reservationService.findById(id);
    }

    // 🔹 Update
    @PutMapping("/{id}")
    public ReservationSpeakerDtoResponse update(@PathVariable Long id, @RequestBody ReservationSpeakerDto dto) {
        return reservationService.update(id, dto);
    }

    // 🔹 Delete
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        reservationService.delete(id);
    }

    // 🔹 Find By User UUID
    @GetMapping("/user/{userUuid}")
    public List<ReservationSpeakerDtoResponse> findByUser(@PathVariable String userUuid) {
        return reservationService.findByUser(userUuid);
    }

    // 🔹 Find By Speaker UUID
    @GetMapping("/speaker/{speakerUuid}")
    public List<ReservationSpeakerDtoResponse> findBySpeaker(@PathVariable String speakerUuid) {
        return reservationService.findBySpeaker(speakerUuid);
    }

    // 🔹 Find By Date
    @GetMapping("/date/{date}")
    public List<ReservationSpeakerDtoResponse> findByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return reservationService.findByDate(date);
    }

    // 🔹 Find By User UUID and Date
    @GetMapping("/user/{userUuid}/date/{date}")
    public List<ReservationSpeakerDtoResponse> findByUserAndDate(
            @PathVariable String userUuid,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return reservationService.findByUserAndDate(userUuid, date);
    }

    // 🔹 Find By Speaker UUID and Date
    @GetMapping("/speaker/{speakerUuid}/date/{date}")
    public List<ReservationSpeakerDtoResponse> findBySpeakerAndDate(
            @PathVariable String speakerUuid,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return reservationService.findBySpeakerAndDate(speakerUuid, date);
    }
}
