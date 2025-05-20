package com.example.senseiVoix.dtos.reservation;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRequest {
    private LocalDate date;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private String service;
    private String userUuid;
}
