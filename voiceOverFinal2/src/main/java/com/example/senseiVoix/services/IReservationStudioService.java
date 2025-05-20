package com.example.senseiVoix.services;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.example.senseiVoix.dtos.reservation.ReservationRequest;
import com.example.senseiVoix.dtos.reservation.ReservationResponse;

public interface IReservationStudioService {

    ReservationResponse saveReservation(ReservationRequest request);

    List<ReservationResponse> getReservationsByDate(LocalDate date);

    List<ReservationResponse> getReservationsByDateAndTimeRange(LocalDate date, LocalTime startTime, LocalTime endTime);

    List<ReservationResponse> getReservationsByDateRange(LocalDate startDate, LocalDate endDate);

    List<LocalTime> getReservedHoursByDate(LocalDate date);
}
