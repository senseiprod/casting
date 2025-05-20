package com.example.senseiVoix.services.serviceImp;

import com.example.senseiVoix.dtos.reservation.ReservationRequest;
import com.example.senseiVoix.dtos.reservation.ReservationResponse;
import com.example.senseiVoix.entities.ReservationStudio;
import com.example.senseiVoix.entities.Utilisateur;
import com.example.senseiVoix.repositories.ReservationStudioRepository;
import com.example.senseiVoix.repositories.UtilisateurRepository;
import com.example.senseiVoix.services.IReservationStudioService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationStudioService implements IReservationStudioService {

    private final ReservationStudioRepository reservationRepository;
    private final UtilisateurRepository utilisateurRepository;
   @Override  
    public ReservationResponse saveReservation(ReservationRequest request) {
        Utilisateur user = utilisateurRepository.findByUuid(request.getUserUuid());

        ReservationStudio reservation = new ReservationStudio();
        reservation.setDate(request.getDate());
        reservation.setHeureDebut(request.getHeureDebut());
        reservation.setHeureFin(request.getHeureFin());
        reservation.setService(request.getService());
        reservation.setUser(user);

        ReservationStudio saved = reservationRepository.save(reservation);

        return mapToResponse(saved);
    }
    @Override 
    public List<ReservationResponse> getReservationsByDate(LocalDate date) {
        return reservationRepository.findByDate(date)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    @Override
    public List<ReservationResponse> getReservationsByDateAndTimeRange(LocalDate date, LocalTime startTime, LocalTime endTime) {
        return reservationRepository.findByDateAndTimeRange(date, startTime, endTime)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    @Override
    public List<ReservationResponse> getReservationsByDateRange(LocalDate startDate, LocalDate endDate) {
        return reservationRepository.findByDateRange(startDate, endDate)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    @Override
    public List<LocalTime> getReservedHoursByDate(LocalDate date) {
        return reservationRepository.findReservedHoursByDate(date);
    }

    // MAPPER DTO -> ENTITY
    private ReservationResponse mapToResponse(ReservationStudio reservation) {
        return new ReservationResponse(
                reservation.getDate(),
                reservation.getHeureDebut(),
                reservation.getHeureFin(),
                reservation.getService(),
                reservation.getUser().getUuid()
        );
    }
}
