package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.reservation.ReservationSpeakerDto;
import com.example.senseiVoix.dtos.reservation.ReservationSpeakerDtoResponse;
import com.example.senseiVoix.entities.ReservationSpeaker;
import com.example.senseiVoix.entities.Speaker;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.repositories.ReservationSpeakerRepository;
import com.example.senseiVoix.repositories.SpeakerRepository;
import com.example.senseiVoix.repositories.UtilisateurRepository;
import com.example.senseiVoix.services.IReservationSpeakerService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReservationSpeakerService implements IReservationSpeakerService {
    @Autowired
    private  ReservationSpeakerRepository reservationRepo;
    @Autowired
    private  UtilisateurRepository utilisateurRepo;
    @Autowired
    private  SpeakerRepository speakerRepo;

    // 🔹 Create
    @Override
    public ReservationSpeakerDtoResponse create(ReservationSpeakerDto dto) {
        Utilisateur user = utilisateurRepo.findByUuid(dto.getUserUuid());
        Speaker speaker = speakerRepo.findByUuid(dto.getSpeakerUuid());

        ReservationSpeaker reservation = new ReservationSpeaker();
        reservation.setDate(dto.getDate());
        reservation.setUser(user);
        reservation.setSpeaker(speaker);
        reservation.setService(dto.getService());

        ReservationSpeaker saved = reservationRepo.save(reservation);
        return mapToDto(saved);
    }

    // 🔹 Read - All
    @Override
    public List<ReservationSpeakerDtoResponse> findAll() {
        return reservationRepo.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // 🔹 Read - By ID
    public Optional<ReservationSpeakerDtoResponse> findById(Long id) {
        return reservationRepo.findById(id)
                .map(this::mapToDto);
    }

    // 🔹 Update
    @Override
    public ReservationSpeakerDtoResponse update(Long id, ReservationSpeakerDto dto) {
        ReservationSpeaker reservation = reservationRepo.findById(id).get();

        reservation.setDate(dto.getDate());
        reservation.setService(dto.getService());

        reservation.setUser(utilisateurRepo.findByUuid(dto.getUserUuid()));
        reservation.setSpeaker(speakerRepo.findByUuid(dto.getSpeakerUuid()));

        ReservationSpeaker updated = reservationRepo.save(reservation);
        return mapToDto(updated);
    }

    // 🔹 Delete
    @Override
    public void delete(Long id) {
        reservationRepo.deleteById(id);
    }
    @Override
    public List<ReservationSpeakerDtoResponse> findByUser(String userUuid) {
        Utilisateur user = utilisateurRepo.findByUuid(userUuid);
        return reservationRepo.findByUser(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReservationSpeakerDtoResponse> findBySpeaker(String speakerUuid) {
        Speaker speaker = speakerRepo.findByUuid(speakerUuid);
        return reservationRepo.findBySpeaker(speaker).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReservationSpeakerDtoResponse> findByDate(LocalDate date) {
        return reservationRepo.findByDate(date).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReservationSpeakerDtoResponse> findByUserAndDate(String userUuid, LocalDate date) {
        Utilisateur user = utilisateurRepo.findByUuid(userUuid);
        return reservationRepo.findByUserAndDate(user, date).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ReservationSpeakerDtoResponse> findBySpeakerAndDate(String speakerUuid, LocalDate date) {
        Speaker speaker = speakerRepo.findByUuid(speakerUuid);
        return reservationRepo.findBySpeakerAndDate(speaker, date).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }



    // 🔹 Mapping
    private ReservationSpeakerDtoResponse mapToDto(ReservationSpeaker reservation) {
        return new ReservationSpeakerDtoResponse(
                reservation.getDate(),
                reservation.getUser().getUuid(),
                reservation.getSpeaker().getUuid(),
                reservation.getService(),
                reservation.getId().toString()
        );
    }
}
