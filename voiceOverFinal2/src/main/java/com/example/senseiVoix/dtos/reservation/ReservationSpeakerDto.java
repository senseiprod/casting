package com.example.senseiVoix.dtos.reservation;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationSpeakerDto {
    private LocalDate date;
    private String userUuid;
    private String speakerUuid;
    private String service;
}
