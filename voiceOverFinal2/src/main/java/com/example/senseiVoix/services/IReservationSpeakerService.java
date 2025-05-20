package com.example.senseiVoix.services;

import com.example.senseiVoix.dtos.reservation.ReservationSpeakerDto;
import com.example.senseiVoix.dtos.reservation.ReservationSpeakerDtoResponse;
import java.time.LocalDate;
import java.util.List;
public interface IReservationSpeakerService {

    ReservationSpeakerDtoResponse create(ReservationSpeakerDto dto);

    List<ReservationSpeakerDtoResponse> findAll();  

    ReservationSpeakerDtoResponse update(Long id, ReservationSpeakerDto dto);

    void delete(Long id);

    List<ReservationSpeakerDtoResponse> findByUser(String userUuid);

    List<ReservationSpeakerDtoResponse> findBySpeaker(String speakerUuid);

    List<ReservationSpeakerDtoResponse> findByDate(LocalDate date);

    List<ReservationSpeakerDtoResponse> findByUserAndDate(String userUuid, LocalDate date);

    List<ReservationSpeakerDtoResponse> findBySpeakerAndDate(String speakerUuid, LocalDate date);
}
